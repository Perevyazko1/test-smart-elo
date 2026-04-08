"""
AI-планирование производства.

Основной поток (Celery-задача generate_ai_plan_full):
  Этап 1: Сбор данных + валидация графов цехов
  Этап 2: Python рассчитывает веса всех заказов (формула: сроки × K1 + прогресс × K2 + загрузка × K3)
  Этап 3: GPT batch — комментарии и корректировка весов для топ-50
  Этап 4: Построение chart-таблицы (раскладка заказов по цехам и дням с учётом графа зависимостей)
  Этап 5: GPT summary — план на день + рекомендации + предупреждения
"""

import logging
import math
import time
import requests
from celery import shared_task

logger = logging.getLogger(__name__)

# URL-ы n8n вебхуков для вызова GPT
N8N_SUMMARY_URL = 'http://n8n:5678/webhook/ai-plan-summary'
N8N_BATCH_URL = 'http://n8n:5678/webhook/ai-plan-batch'

BATCH_SIZE = 50       # Сколько топ-заказов отправлять GPT для комментариев
MAX_RETRIES = 3       # Количество попыток при сетевых ошибках
RETRY_DELAY = 10      # Задержка между попытками (секунд)
WORK_HOURS = 8        # Рабочих часов в дне


# ─── Утилиты ──────────────────────────────────────────────────────

def _request_with_retry(url, payload, timeout=180):
    """POST запрос к n8n с повторными попытками при сетевых ошибках (ECONNRESET, timeout)."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            resp.raise_for_status()
            return resp
        except (requests.ConnectionError, requests.Timeout) as e:
            if attempt == MAX_RETRIES:
                raise
            logger.warning(f'Запрос к {url} не удался (попытка {attempt}/{MAX_RETRIES}): {e}. Повтор через {RETRY_DELAY}с...')
            time.sleep(RETRY_DELAY)


def _update_config(**fields):
    """Обновить поля AiPlanConfig (singleton, pk=1). Используется для трекинга прогресса задачи."""
    from plan.models import AiPlanConfig
    config, _ = AiPlanConfig.objects.get_or_create(pk=1)
    for k, v in fields.items():
        setattr(config, k, v)
    config.save(update_fields=list(fields.keys()) + ['updated_at'])
    return config


def _is_cancelled():
    """Проверить, отменил ли пользователь задачу генерации."""
    from plan.models import AiPlanConfig
    try:
        config = AiPlanConfig.objects.get(pk=1)
        return config.task_status == 'cancelled'
    except AiPlanConfig.DoesNotExist:
        return False


# ─── Скоринг: три компонента формулы веса ─────────────────────────

def _score_deadline(days_left):
    """Компонент СРОКИ: 0-100.
    Чем сильнее просрочен заказ — тем выше балл.
    Заказы без дедлайна получают 0.

    Шкала:
      просрочен > 180 дней → 100 (максимальная срочность)
      просрочен > 90 дней  → 85
      просрочен > 30 дней  → 70
      просрочен            → 55
      до 7 дней            → 40
      до 14 дней           → 25
      до 30 дней           → 10
      больше 30 дней       → 0  (не срочно)
    """
    if days_left is None:
        return 0
    if days_left < -180:
        return 100
    if days_left < -90:
        return 85
    if days_left < -30:
        return 70
    if days_left < 0:
        return 55
    if days_left <= 7:
        return 40
    if days_left <= 14:
        return 25
    if days_left <= 30:
        return 10
    return 0


def _score_progress(departments):
    """Компонент ПРОГРЕСС: -50 до 100.
    Почти готовые заказы (80%+ цехов завершено) получают высокий балл — "дожать".
    Полностью готовые получают -50 — опускаем вниз.

    departments: dict {dept_name: {ready: int, all: int}}
    Считаем процент завершённых цехов (не штук, а цехов где ready >= all).
    """
    total_tasks = 0
    done_tasks = 0
    for dept, status in departments.items():
        all_count = status.get('all', 0)
        ready_count = status.get('ready', 0)
        if all_count > 0:
            total_tasks += 1
            if ready_count >= all_count:
                done_tasks += 1

    if total_tasks == 0:
        return 0

    pct = done_tasks / total_tasks * 100

    if pct >= 100:
        return -50  # Все цеха завершили — нечего делать, опускаем
    if pct >= 80:
        return 100  # Почти готов — дожать! Максимальный приоритет
    if pct >= 60:
        return 65
    if pct >= 40:
        return 35
    if pct >= 20:
        return 15
    return 0


def _invert_workflow(workflow):
    """Инвертировать граф цехов: из формата "куда передаёт" в формат "от кого зависит".

    Вход:  {"Пила": ["Сборка"], "Лазер": ["Сборка"]}
    Выход: {"Сборка": ["Пила", "Лазер"]}

    Узлы "Старт" и "Готово" пропускаются — это виртуальные узлы графа.
    """
    deps = {}
    for src, targets in workflow.items():
        if src in ('Старт', 'Готово'):
            continue
        for tgt in targets:
            if tgt in ('Старт', 'Готово'):
                continue
            if tgt not in deps:
                deps[tgt] = []
            deps[tgt].append(src)
    return deps


def _score_dept_load(departments, dept_load_days, workflow=None, target_loads=None):
    """Компонент ЗАГРУЗКА ЦЕХОВ: -50 до 100.
    Оценивает: нуждаются ли цеха, задействованные в этом заказе, в работе.

    departments:    dict {dept: {ready, all}} — что нужно этому заказу по цехам
    dept_load_days: dict {dept: float} — текущая загрузка каждого цеха в днях
    workflow:       граф зависимостей (формат "куда передаёт") или None
    target_loads:   dict {dept: int} — целевая загрузка из эквалайзера (дни)

    Логика:
    1. Для каждого цеха заказа — сравниваем текущую загрузку с target:
       - загрузка < target → бонус (дефицит / target × 60 × коэфф.объёма), до ~60 баллов
       - загрузка > target × 2 → штраф -20 (цех и так перегружен)
    2. Объём заказа влияет на бонус: заказ на 34 шт загружает цех сильнее,
       чем заказ на 2 шт, и поэтому получает больший приоритет в голодающем цехе.
    3. Если есть граф — проверяем потомков: если цех-потомок голодает,
       нужно подгрузить его зависимости (этот цех), бонус до 40 баллов
    """
    score = 0
    for dept, status in departments.items():
        all_count = status.get('all', 0)
        ready_count = status.get('ready', 0)
        remaining = all_count - ready_count
        if remaining <= 0:
            continue  # Этот цех для заказа уже завершён

        load = dept_load_days.get(dept, 999)
        target = (target_loads or {}).get(dept, 7)  # Дефолт 7 дней если не задано

        # Коэффициент объёма: заказ на 34 шт (factor=3.0) получает бонус в 3 раза больше,
        # чем заказ на 2 шт (factor=0.2). Это даёт дифференциацию между заказами —
        # без этого все заказы в одном цехе получали бы одинаковый бонус.
        # Ограничиваем от 0.2 (мин. 1 шт) до 3.0 (макс. 30+ шт).
        volume_factor = min(remaining / 10.0, 3.0)
        volume_factor = max(volume_factor, 0.2)

        if load < target:
            # Цех загружен меньше целевого — нужно подгрузить.
            # Чем больше дефицит и объём заказа — тем выше бонус.
            deficit = target - load
            base_bonus = (deficit / max(target, 1)) * 60
            score += int(base_bonus * volume_factor)
        elif load > target * 2:
            # Цех перегружен в 2+ раза — штраф, не стоит добавлять ещё работу.
            # Большие заказы получают больший штраф (не надо нагружать перегруженный цех).
            score -= int(20 * volume_factor)

    # Учёт зависимостей по графу: если цех-потомок голодает — подгрузить этот цех
    if workflow:
        for dept, status in departments.items():
            remaining = status.get('all', 0) - status.get('ready', 0)
            if remaining <= 0:
                continue
            # Проверить: кто получает работу ОТ этого цеха? (потомки по графу)
            # Если потомок голодает — срочно подгрузить этот цех, чтобы потомок не простаивал.
            targets = workflow.get(dept, [])
            for tgt in targets:
                if tgt in ('Старт', 'Готово'):
                    continue
                tgt_load = dept_load_days.get(tgt, 999)
                tgt_target = (target_loads or {}).get(tgt, 7)
                if tgt_load < tgt_target * 0.3:
                    score += 40  # Потомок почти пустой — срочно подгрузить!
                elif tgt_load < tgt_target * 0.7:
                    score += 20  # Потомок скоро будет голодать

    return min(max(score, -50), 100)


# ─── Расчёт весов ────────────────────────────────────────────────

def _calculate_all_weights(orders, dept_summary, config, workflows=None):
    """Рассчитать веса (приоритеты) всех заказов.

    Формула: weight = (S_deadline × K1 + S_progress × K2 + S_dept_load × K3) / max → 0-1000

    K1, K2, K3 — коэффициенты из настроек (слайдеры 0-50 на фронте).
    S_deadline, S_progress, S_dept_load — компоненты 0-100 из функций выше.

    Returns: list of {series_id, weight, detail: {deadline, progress, dept_load}}
    """
    from plan.models import DepartmentWorkers

    k1 = config.weight_k_deadline
    k2 = config.weight_k_progress
    k3 = config.weight_k_dept_load

    # Загруженность цехов в днях (рассчитана в _collect_orders_data)
    dept_load_days = {}
    for dept, info in dept_summary.items():
        dept_load_days[dept] = info.get('days_needed', 999)

    # Целевая загрузка из эквалайзера — "сколько дней работы хочу видеть в каждом цехе"
    target_loads = {dw.department: dw.target_load_days for dw in DepartmentWorkers.objects.all()}

    results = []
    for order in orders:
        s_deadline = _score_deadline(order.get('days_left'))
        s_progress = _score_progress(order.get('departments', {}))

        # Получить граф зависимостей для типа изделия этого заказа
        wf = (workflows or {}).get(order.get('product_type', ''))
        s_dept_load = _score_dept_load(
            order.get('departments', {}), dept_load_days, wf, target_loads
        )

        # Взвешенная сумма компонентов
        raw_weight = (s_deadline * k1 + s_progress * k2 + s_dept_load * k3)

        # Нормализация к шкале 0-1000
        max_possible = 100 * (k1 + k2 + k3) if (k1 + k2 + k3) > 0 else 1
        weight = int(raw_weight / max_possible * 1000)
        weight = max(0, min(1000, weight))

        results.append({
            'series_id': order['series_id'],
            'weight': weight,
            'detail': {
                'deadline': s_deadline,
                'progress': s_progress,
                'dept_load': s_dept_load,
            },
        })

    # Гарантия уникальности весов — GPT и фронт ожидают что каждый вес уникален.
    # При совпадении — уменьшаем на 1 до уникальности.
    results.sort(key=lambda x: x['weight'], reverse=True)
    seen = set()
    for r in results:
        while r['weight'] in seen:
            r['weight'] -= 1
        seen.add(r['weight'])

    return results


def _save_weights_to_db(weight_results):
    """Сохранить рассчитанные веса в таблицу AiPlanEntry."""
    from plan.models import AiPlanEntry
    from core.models import OrderProduct

    for r in weight_results:
        sid = r['series_id']
        try:
            op = OrderProduct.objects.filter(series_id=sid).first()
            if not op:
                continue
            entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
            entry.sort_weight = r['weight']
            entry.weight_detail = r['detail']
            entry.save(update_fields=['sort_weight', 'weight_detail', 'updated_at'])
        except Exception as e:
            logger.warning(f'Не удалось сохранить вес для {sid}: {e}')


# ─── Chart: раскладка заказов по цехам и дням ────────────────────

def _build_chart_grid():
    """Построить таблицу загрузки цехов: каждый заказ распределяется по дням
    с учётом графа зависимостей (Сборка ждёт Пилу и Лазер).

    Алгоритм:
    1. Для каждого заказа в каждом цехе рассчитать hours_needed = remaining × hours_per_unit
    2. Цеха обрабатываются в топологическом порядке (сначала Пила, потом Сборка)
    3. Заказы внутри цеха сортируются по sort_weight (приоритетные первые)
    4. Заказ в цехе B начинается не раньше, чем закончится во всех цехах-зависимостях
    5. Дни заполняются до исчерпания capacity (рабочие × 8ч), потом следующий день

    Returns: dict {departments, total_days, grid: {dept: [{orders, load, hours}]}}
    """
    from plan.models import (
        AiPlanEntry, ProductType, ProductionNorm,
        ProductNormOverride, DepartmentWorkers
    )
    from core.models import OrderProduct, Assignment
    from staff.models import Department

    # --- Загрузка справочных данных ---

    departments = list(
        Department.objects.filter(has_norms=True)
        .order_by('ordering', 'name')
        .values_list('name', flat=True)
    )

    # Нормативы: сколько часов нужно на 1 изделие в каждом цехе
    norms = {}
    for n in ProductionNorm.objects.select_related('product_type').all():
        if n.product_type.name not in norms:
            norms[n.product_type.name] = {}
        norms[n.product_type.name][n.department] = n.hours_per_unit

    # Переопределения нормативов для конкретных изделий (приоритет выше чем тип)
    overrides = {}
    for o in ProductNormOverride.objects.all():
        overrides[(o.product_id, o.department)] = o.hours_per_unit

    # Рабочие и capacity каждого цеха
    workers = {dw.department: dw.workers_count for dw in DepartmentWorkers.objects.all()}
    capacity = {dept: workers.get(dept, 1) * WORK_HOURS for dept in departments}

    # Графы зависимостей цехов по типам изделий
    workflows = {}
    for pt in ProductType.objects.all():
        if pt.workflow_graph:
            workflows[pt.name] = pt.workflow_graph

    # Веса для сортировки (из последней генерации AI плана)
    weights = {}
    for e in AiPlanEntry.objects.all():
        weights[e.order_product_id] = e.sort_weight

    # --- Загрузка заказов ---

    order_products = OrderProduct.objects.filter(
        status='0'
    ).select_related(
        'product', 'product__production_type', 'order'
    ).prefetch_related('product__product_pictures')

    # Собрать данные: для каждого заказа → по каждому цеху → remaining и hours
    order_dept_data = []

    for op in order_products:
        assignments = Assignment.objects.filter(order_product=op)
        product_type_name = op.product.production_type.name if op.product.production_type else None
        pic = op.product.product_pictures.first()
        picture_url = pic.thumbnail.url if pic else None
        weight = weights.get(op.id, 500)

        # Собрать статус по цехам (сколько всего заданий / сколько готово)
        dept_info = {}
        for a in assignments:
            dept_name = a.department.name if a.department else None
            if not dept_name or dept_name not in departments:
                continue
            if dept_name not in dept_info:
                dept_info[dept_name] = {'all': 0, 'ready': 0}
            dept_info[dept_name]['all'] += 1
            if a.status == 'ready' and a.inspector is not None:
                dept_info[dept_name]['ready'] += 1

        # Рассчитать часы на оставшуюся работу в каждом цехе
        depts = {}
        for dept_name, status in dept_info.items():
            remaining = status['all'] - status['ready']
            if remaining <= 0:
                continue

            # Приоритет: override для конкретного Product > дефолт из ProductType
            override_key = (op.product_id, dept_name)
            if override_key in overrides:
                hours_per = overrides[override_key]
            elif product_type_name and dept_name in norms.get(product_type_name, {}):
                hours_per = norms[product_type_name][dept_name]
            else:
                hours_per = 1  # Запасное значение если норматив не задан

            depts[dept_name] = {
                'remaining': remaining,
                'hours': remaining * hours_per,
            }

        if depts:
            order_dept_data.append({
                'op_id': op.id,
                'series_id': op.series_id,
                'name': op.product.name,
                'order': op.order.inner_number if op.order else '',
                'picture': picture_url,
                'product_type': product_type_name,
                'weight': weight,
                'depts': depts,
            })

    # Приоритетные заказы первые
    order_dept_data.sort(key=lambda x: x['weight'], reverse=True)

    # --- Топологическая сортировка цехов ---
    # Чтобы при раскладке сначала обработать Пилу/Лазер, потом Сборку,
    # и finish_day был уже заполнен для зависимостей.

    def get_topo_order():
        """Топологическая сортировка цехов по всем графам (алгоритм Кана)."""
        all_edges = {}  # {dept: set(зависимости)}
        for wf in workflows.values():
            for src, targets in wf.items():
                for tgt in targets:
                    if tgt not in all_edges:
                        all_edges[tgt] = set()
                    all_edges[tgt].add(src)

        in_degree = {d: 0 for d in departments}
        adj = {d: [] for d in departments}
        for d in departments:
            for dep in all_edges.get(d, []):
                if dep in departments:
                    in_degree[d] += 1
                    adj[dep].append(d)

        queue = sorted([d for d in departments if in_degree[d] == 0])
        result = []
        while queue:
            node = queue.pop(0)
            result.append(node)
            for neighbor in adj[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
                    queue.sort()  # Стабильность порядка

        # Цеха без графов — в конец
        for d in departments:
            if d not in result:
                result.append(d)
        return result

    topo_depts = get_topo_order()

    # --- Раскладка заказов по дням ---

    # finish_day[series_id][dept] = день, ПОСЛЕ которого заказ завершён в этом цехе.
    # Используется для расчёта earliest_start зависимых цехов.
    finish_day = {}

    # Состояние каждого цеха: массив дней с заказами и часами
    dept_state = {dept: [] for dept in departments}

    def get_earliest_start(order, dept):
        """Определить самый ранний день когда заказ может начаться в цехе.
        Заказ может начаться в Сборке только после завершения в Пиле И Лазере.
        """
        sid = order['series_id']
        pt = order['product_type']
        wf = workflows.get(pt)
        if not wf:
            return 0  # Нет графа — начинаем сразу

        # Инвертируем: из "Пила → [Сборка]" получаем "Сборка зависит от [Пила, Лазер]"
        deps = _invert_workflow(wf)
        dep_depts = deps.get(dept, [])

        earliest = 0
        for dep_dept in dep_depts:
            # Когда заказ закончится в цехе-зависимости?
            if sid in finish_day and dep_dept in finish_day[sid]:
                earliest = max(earliest, finish_day[sid][dep_dept])
        return earliest

    # Обходим цеха в топологическом порядке
    for dept in topo_depts:
        cap = capacity.get(dept, WORK_HOURS)

        # Заказы для этого цеха, уже отсортированные по весу
        dept_orders = [(o, o['depts'][dept]) for o in order_dept_data if dept in o['depts']]

        for order, info in dept_orders:
            earliest = get_earliest_start(order, dept)
            hours_left = info['hours']
            sid = order['series_id']

            day = earliest
            while hours_left > 0:
                # Создать день если его ещё нет
                while len(dept_state[dept]) <= day:
                    dept_state[dept].append({'orders': [], 'hours': 0})

                day_data = dept_state[dept][day]
                day_free = cap - day_data['hours']

                if day_free <= 0:
                    # День полностью занят — переходим на следующий
                    day += 1
                    continue

                take = min(hours_left, day_free)

                # Добавить заказ в ячейку дня
                day_data['orders'].append({
                    'name': order['name'],
                    'order': order['order'],
                    'picture': order['picture'],
                    'count': info['remaining'],
                })
                day_data['hours'] += take
                hours_left -= take

                if hours_left <= 0:
                    # Заказ завершён в этом цехе — запомнить день завершения.
                    # Следующий цех (по графу) сможет начать со следующего дня.
                    if sid not in finish_day:
                        finish_day[sid] = {}
                    finish_day[sid][dept] = day + 1
                else:
                    day += 1

    # --- Формирование результата ---

    total_days = max((len(days) for days in dept_state.values()), default=1)

    grid = {}
    for dept in departments:
        cap = capacity.get(dept, WORK_HOURS)
        row = []
        for d in range(total_days):
            if d < len(dept_state[dept]):
                cell = dept_state[dept][d]
                hours = cell['hours']
                # Определение уровня загрузки ячейки (для цвета на фронте)
                if hours >= cap * 1.2:
                    load = 'overload'   # Перегрузка — красный
                elif hours >= cap * 0.5:
                    load = 'full'       # Загружен нормально — жёлтый
                elif hours > 0:
                    load = 'light'      # Мало работы — зелёный
                else:
                    load = 'empty'      # Пусто — белый
                row.append({
                    'orders': cell['orders'],
                    'load': load,
                    'hours': round(hours, 1),
                })
            else:
                row.append({'orders': [], 'load': 'empty', 'hours': 0})
        grid[dept] = row

    return {
        'departments': departments,
        'total_days': total_days,
        'grid': grid,
    }


def _build_grid_summary(chart_data):
    """Построить краткую сводку по графику загрузки для GPT.

    Для каждого цеха считаем:
    - loaded_days: сколько дней с работой
    - overloaded_days: сколько дней с перегрузкой
    - runs_out_day: через сколько дней цех останется без работы
    - is_terminal: терминальный ли цех (последний в графе, например Упаковка)

    Терминальные цеха (Упаковка, Обивка) по определению ждут все предыдущие.
    Их простой — это штатная ситуация, а не проблема. GPT не должен
    предупреждать о простое терминальных цехов.
    """
    from plan.models import ProductType

    # Определить терминальные цеха — те, которые являются листьями графа.
    # Цех терминальный, если он не является источником ни для одного другого цеха
    # (кроме виртуального узла "Готово").
    terminal_depts = set()
    all_sources = set()  # Цеха, от которых идут стрелки к другим цехам
    all_targets = set()  # Цеха, куда входят стрелки

    for pt in ProductType.objects.all():
        if not pt.workflow_graph:
            continue
        for src, targets in pt.workflow_graph.items():
            if src in ('Старт', 'Готово'):
                continue
            for tgt in targets:
                if tgt in ('Старт', 'Готово'):
                    continue
                all_sources.add(src)
                all_targets.add(tgt)

    # Терминальные = цеха-цели, которые сами никуда не передают
    # (не являются источниками для других рабочих цехов)
    terminal_depts = all_targets - all_sources

    summary = {}
    for dept, days in chart_data.get('grid', {}).items():
        loaded_days = sum(1 for d in days if d['load'] != 'empty')
        overloaded_days = sum(1 for d in days if d['load'] == 'overload')
        # День когда цех впервые остаётся без работы
        runs_out = next((i for i, d in enumerate(days) if d['load'] == 'empty'), len(days))
        summary[dept] = {
            'loaded_days': loaded_days,
            'overloaded_days': overloaded_days,
            'runs_out_day': runs_out,
            'is_terminal': dept in terminal_depts,
        }
    return summary


# ─── Основная Celery-задача ──────────────────────────────────────

@shared_task(name="generate_ai_plan_full", bind=True, max_retries=0, time_limit=3600, soft_time_limit=3500)
def generate_ai_plan_full(self):
    """Полный цикл генерации AI-плана производства.

    Этапы:
    1. Сбор данных + валидация (у всех типов должны быть графы цехов)
    2. Python рассчитывает веса всех заказов
    3. GPT batch — комментарии для топ-50 + adjustment по feedback
    4. Построение chart-таблицы (раскладка по дням)
    5. GPT summary — план дня + рекомендации + предупреждения
    """
    from plan.views import _collect_orders_data, _get_ai_config

    _update_config(
        task_id=self.request.id or '',
        task_status='running',
        task_phase='Сбор данных...',
        task_progress=0,
        task_total=0,
        task_error='',
    )

    try:
        # ──── Этап 1: Сбор данных + валидация графов ────

        data = _collect_orders_data()
        config = _get_ai_config()
        orders = data['orders']
        total = len(orders)
        workflows = data.get('workflows', {})

        # Проверить что у ВСЕХ используемых типов изделий задан граф цехов.
        # Без графа невозможно правильно рассчитать загрузку и построить chart.
        used_types = set()
        for o in orders:
            pt = o.get('product_type')
            if pt:
                used_types.add(pt)

        missing_graphs = [t for t in used_types if t not in workflows]
        if missing_graphs:
            _update_config(
                task_status='failed',
                task_phase='',
                task_error=f'Не задан граф цехов для типов: {", ".join(sorted(missing_graphs))}. '
                           f'Откройте таблицу нормативов и выберите схему для каждого типа.',
            )
            return

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # ──── Этап 2: Python считает веса всем заказам ────
        # Формула: weight = (S_deadline × K1 + S_progress × K2 + S_dept_load × K3) / max → 0-1000
        # K1-K3 — из настроек приоритетов (слайдеры на фронте)
        # target_load_days — из эквалайзера загрузки цехов

        _update_config(task_phase='Расчёт весов...', task_total=total)

        weight_results = _calculate_all_weights(orders, data['dept_summary'], config, workflows)
        weight_map = {r['series_id']: r for r in weight_results}

        # Сохранить веса в БД — фронт сразу увидит обновлённую сортировку
        _save_weights_to_db(weight_results)

        _update_config(task_phase='Комментарии AI...', task_progress=0)

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # ──── Этап 3: GPT batch — комментарии + корректировка (только топ-50) ────
        # GPT получает топ-50 заказов и для каждого:
        # - Пишет ai_comment (почему этот заказ в приоритете)
        # - Даёт weight_adjustment (-100 до +100) на основе обратной связи менеджера
        # Корректировка применяется с коэффициентом K4 (обратная связь)

        sorted_by_weight = sorted(weight_results, key=lambda x: x['weight'], reverse=True)
        top_series_ids = {r['series_id'] for r in sorted_by_weight[:BATCH_SIZE]}

        # Обогащаем заказы рассчитанным весом для контекста GPT
        top_orders = []
        for o in orders:
            if o['series_id'] in top_series_ids:
                o_copy = dict(o)
                o_copy['calculated_weight'] = weight_map[o['series_id']]['weight']
                top_orders.append(o_copy)

        batch_payload = {
            'base_prompt': config.base_prompt,
            'orders': top_orders,
            'department_load': data['dept_summary'],
            'today': data['today'],
        }

        resp = _request_with_retry(N8N_BATCH_URL, batch_payload, timeout=180)
        resp.raise_for_status()
        gpt_entries = resp.json().get('entries', [])

        # Применить GPT корректировку и сохранить комментарии
        from plan.models import AiPlanEntry
        from core.models import OrderProduct

        k4 = config.weight_k_feedback  # Коэффициент влияния обратной связи (0-50)

        for entry in gpt_entries:
            sid = entry.get('series_id', '')
            adj = entry.get('weight_adjustment', 0)
            comment = entry.get('ai_comment', '')

            try:
                op = OrderProduct.objects.filter(series_id=sid).first()
                if not op:
                    continue
                ai_entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
                ai_entry.ai_comment = comment

                # Применить корректировку: нормализуем по K4 (0-50).
                # adj=100 при K4=50 даёт +100, при K4=25 даёт +50.
                base_weight = weight_map.get(sid, {}).get('weight', 500)
                adj_value = int(adj * k4 / 50)
                final_weight = max(0, min(1000, base_weight + adj_value))
                ai_entry.sort_weight = final_weight

                # Сохранить детали для всплывающей подсказки на фронте
                detail = weight_map.get(sid, {}).get('detail', {})
                detail['adjustment'] = adj
                detail['adj_reason'] = comment
                ai_entry.weight_detail = detail

                ai_entry.save(update_fields=['ai_comment', 'sort_weight', 'weight_detail', 'updated_at'])
            except Exception as e:
                logger.warning(f'Не удалось сохранить GPT запись для {sid}: {e}')

        _update_config(task_progress=total)

        # Гарантия уникальности финальных весов (после GPT корректировки могли появиться дубли)
        all_entries_db = list(AiPlanEntry.objects.all().values('id', 'sort_weight'))
        all_entries_db.sort(key=lambda x: x['sort_weight'], reverse=True)
        seen = set()
        for e in all_entries_db:
            while e['sort_weight'] in seen:
                e['sort_weight'] -= 1
            seen.add(e['sort_weight'])
            AiPlanEntry.objects.filter(id=e['id']).update(sort_weight=e['sort_weight'])

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # ──── Этап 4: Chart — раскладка заказов по дням ────
        # Строим таблицу загрузки цехов с учётом графа зависимостей.
        # Результат кэшируется в AiPlanConfig.chart_data — фронт забирает готовое.

        _update_config(task_phase='Построение графика...')

        chart_data = _build_chart_grid()

        from plan.models import AiPlanConfig as ConfigModel
        cfg = ConfigModel.objects.get(pk=1)
        cfg.chart_data = chart_data
        cfg.save(update_fields=['chart_data', 'updated_at'])

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # ──── Этап 5: Summary + рекомендации + предупреждения ────
        # GPT получает: топ-30 заказов, разбивку по цехам, прогноз загрузки (grid_summary).
        # Пишет: план на день + рекомендации по улучшению + предупреждения о проблемах.

        _update_config(task_phase='Генерация плана на день...')

        # Загрузить финальные данные из БД (с учётом GPT корректировки)
        order_by_series = {o['series_id']: o for o in orders}
        final_entries = AiPlanEntry.objects.order_by('-sort_weight')[:30]

        # Загрузить обратную связь менеджеров
        feedback_map = {}
        for e in AiPlanEntry.objects.exclude(feedback='').values('order_product__series_id', 'feedback'):
            feedback_map[e['order_product__series_id']] = e['feedback']

        top_orders_list = []
        for entry in final_entries:
            sid = entry.order_product.series_id
            o = order_by_series.get(sid, {})
            top_orders_list.append({
                'order': o.get('order', ''),
                'product': o.get('product', ''),
                'product_type': o.get('product_type', ''),
                'quantity': o.get('quantity', 0),
                'deadline': o.get('deadline', ''),
                'days_left': o.get('days_left'),
                'project': o.get('project', ''),
                'departments': o.get('departments', {}),
                'sort_weight': entry.sort_weight,
                'ai_comment': entry.ai_comment,
                'feedback': feedback_map.get(sid, ''),
            })

        # Группировка заказов по цехам — GPT пишет задачи для каждого цеха
        dept_orders = {}
        for o in top_orders_list:
            for dept, status in o.get('departments', {}).items():
                if status.get('ready', 0) < status.get('all', 0):
                    if dept not in dept_orders:
                        dept_orders[dept] = []
                    dept_orders[dept].append({
                        'order': o['order'],
                        'product': o['product'],
                        'quantity': o['quantity'],
                        'sort_weight': o['sort_weight'],
                        'status': f"{status['ready']}/{status['all']}",
                        'ai_comment': o['ai_comment'],
                    })

        # Прогноз загрузки из chart — для рекомендаций и предупреждений
        grid_summary = _build_grid_summary(chart_data)

        summary_payload = {
            'base_prompt': config.base_prompt,
            'department_load': data['dept_summary'],
            'type_counts': data['type_counts'],
            'total_orders': data['total_orders'],
            'overdue_count': data['overdue_count'],
            'urgent_count': data['urgent_count'],
            'daily_capacity': data['daily_capacity'],
            'bottleneck_items_per_day': data['bottleneck_items_per_day'],
            'today': data['today'],
            'top_orders': top_orders_list,
            'dept_orders': dept_orders,
            'grid_summary': grid_summary,
            'priorities': {
                'k_deadline': config.weight_k_deadline,
                'k_progress': config.weight_k_progress,
                'k_dept_load': config.weight_k_dept_load,
                'k_feedback': config.weight_k_feedback,
            },
        }

        resp = _request_with_retry(N8N_SUMMARY_URL, summary_payload, timeout=120)
        resp.raise_for_status()
        summary = resp.json().get('summary', '')

        cfg = ConfigModel.objects.get(pk=1)
        cfg.ai_summary = summary
        cfg.save(update_fields=['ai_summary', 'updated_at'])

        _update_config(task_status='completed', task_phase='', task_progress=total)

    except Exception as e:
        logger.error(f'Ошибка генерации AI плана: {e}', exc_info=True)
        _update_config(task_status='failed', task_phase='', task_error=str(e))
