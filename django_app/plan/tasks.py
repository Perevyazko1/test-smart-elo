"""
AI-планирование производства.

Основной поток (Celery-задача generate_ai_plan_full):
  Этап 1: Сбор данных + валидация графов цехов
  Этап 2: Python рассчитывает веса всех заказов (формула: сроки × K1 + прогресс × K2 + загрузка × K3)
  Этап 3: GPT batch — комментарии и корректировка весов для топ-50
  Этап 4: Построение chart-таблицы (раскладка заказов по цехам и дням с учётом графа зависимостей)
  Этап 5а: GPT settings — рекомендации по настройкам слайдеров и эквалайзера
  Этап 5б: GPT summary — план на день + рекомендации (включая настройки) + предупреждения
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
N8N_SETTINGS_URL = 'http://n8n:5678/webhook/ai-plan-settings'

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


def _score_revenue(price, max_price):
    """Компонент ВЫРУЧКА: 0-100.
    Нормализует стоимость позиции (OrderProduct.price) к шкале 0-100.
    Самый дорогой заказ = 100, бесплатный = 0.

    Используется для приоритизации дорогих заказов — чтобы прибыль
    приходила быстрее. При k_revenue > 0 дорогие заказы получают
    более высокий вес и производятся раньше.

    Args:
        price:     стоимость этой позиции (float)
        max_price: максимальная стоимость среди всех позиций (для нормализации)

    Returns:
        Скор 0-100 (int). 100 = самый дорогой, 0 = бесплатный.
    """
    if max_price <= 0 or price <= 0:
        return 0
    return int((price / max_price) * 100)


# ─── Расчёт весов ────────────────────────────────────────────────

def _calculate_all_weights(orders, dept_summary, config, workflows=None):
    """Рассчитать веса (приоритеты) всех заказов.

    Формула: weight = (S_deadline×K1 + S_progress×K2 + S_dept_load×K3 + S_revenue×K5) / max → 0-1000

    K1-K5 — коэффициенты из настроек (слайдеры на фронте, бюджет 100 на все 5).
    S_deadline, S_progress, S_dept_load, S_revenue — компоненты 0-100.

    Returns: list of {series_id, weight, detail: {deadline, progress, dept_load, revenue}}
    """
    from plan.models import DepartmentWorkers

    k1 = config.weight_k_deadline
    k3 = config.weight_k_dept_load
    k5 = config.weight_k_revenue  # Слайдер "Выручка" — баланс прогресс/выручка
    k2 = 100 - k5  # Прогресс = инверсия выручки (один слайдер управляет обоими)

    # Загруженность цехов в днях (рассчитана в _collect_orders_data)
    dept_load_days = {}
    for dept, info in dept_summary.items():
        dept_load_days[dept] = info.get('days_needed', 999)

    # Целевая загрузка из эквалайзера — "сколько дней работы хочу видеть в каждом цехе"
    target_loads = {dw.department: dw.target_load_days for dw in DepartmentWorkers.objects.all()}

    # Максимальная стоимость позиции — для нормализации s_revenue.
    # Группируем позиции по заказу (order_db_id) и берём сумму цен позиций,
    # чтобы оценивать стоимость ЗАКАЗА, а не отдельной позиции.
    from collections import defaultdict
    order_prices = defaultdict(float)
    for order in orders:
        oid = order.get('order_db_id') or order.get('series_id')
        order_prices[oid] += order.get('price', 0)
    max_order_price = max(order_prices.values(), default=1) or 1

    results = []
    for order in orders:
        s_deadline = _score_deadline(order.get('days_left'))
        s_progress = _score_progress(order.get('departments', {}))

        # Получить граф зависимостей для типа изделия этого заказа
        wf = (workflows or {}).get(order.get('product_type', ''))
        s_dept_load = _score_dept_load(
            order.get('departments', {}), dept_load_days, wf, target_loads
        )

        # Скор выручки: стоимость всего заказа (сумма позиций) → 0-100
        oid = order.get('order_db_id') or order.get('series_id')
        s_revenue = _score_revenue(order_prices[oid], max_order_price)

        # Взвешенная сумма компонентов
        raw_weight = (s_deadline * k1 + s_progress * k2 + s_dept_load * k3 + s_revenue * k5)

        # Нормализация к шкале 0-1000
        k_sum = k1 + k2 + k3 + k5
        max_possible = 100 * k_sum if k_sum > 0 else 1
        weight = int(raw_weight / max_possible * 1000)
        weight = max(0, min(1000, weight))

        results.append({
            'series_id': order['series_id'],
            'weight': weight,
            'detail': {
                'deadline': s_deadline,
                'progress': s_progress,
                'dept_load': s_dept_load,
                'revenue': s_revenue,
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
    3. Сортировка заказов зависит от слайдера "Загрузка цехов" (load_factor):
       - Загрузка низкая → по весу (сроки, прогресс, обр.связь решают)
       - Загрузка высокая → по downstream_path_score (длинные заказы первыми,
         чтобы бутылочное горлышко получало работу раньше)
    4. Стартовые цеха: blend weight + downstream_path по load_factor, последовательно
    5. Зависимые цеха: день-по-день раскладка — каждый день берём что готово,
       blend weight + downstream_path + readiness бонус
    6. Потоковая передача: штуки передаются ежедневно (мин. партия = 1)

    Returns: dict {departments, total_days, grid: {dept: [{orders, load, hours}]}}
    """
    from plan.models import (
        AiPlanEntry, AiPlanConfig, ProductType, ProductionNorm,
        ProductNormOverride, DepartmentWorkers, DepartmentBatchBonus
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

    # Настил по цехам (не зависит от типа изделия) — ускорение при серии одинаковых изделий
    batch_bonuses = {}  # {dept: bonus}
    for b in DepartmentBatchBonus.objects.all():
        if b.batch_bonus > 0:
            batch_bonuses[b.department] = b.batch_bonus

    # Глобальное время переключения (мин) — единое для всех цехов
    _ai_config = AiPlanConfig.objects.first()
    global_setup_minutes = _ai_config.setup_minutes if _ai_config else 0

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

        # Дедлайн позиции: минимальный sort_date среди заданий → дней от сегодня
        from datetime import date as _date_cls
        sort_dates = assignments.filter(sort_date__isnull=False).values_list('sort_date', flat=True)
        deadline_date = min(sort_dates).date() if sort_dates else None
        deadline_days_left = (deadline_date - _date_cls.today()).days if deadline_date else None

        # Дата получения ткани: если задана и в будущем — позиция заблокирована
        fabric_date = op.fabric_available_date  # DateField, nullable
        fabric_blocked = False
        fabric_available_day = 0  # День (от сегодня) когда ткань будет доступна
        if fabric_date:
            days_until = (fabric_date - _date_cls.today()).days
            if days_until > 0:
                fabric_blocked = True
                fabric_available_day = days_until

        if depts:
            order_dept_data.append({
                'op_id': op.id,
                'series_id': op.series_id,
                'product_id': op.product_id,  # ID изделия для группировки настила
                'name': op.product.name,
                'order': op.order.inner_number if op.order else '',
                'order_db_id': op.order_id,  # FK к Order для группировки позиций в заказ
                'price': float(op.price or 0),  # Стоимость позиции для прогноза выручки
                'deadline_days_left': deadline_days_left,  # Дней до дедлайна (None = нет дедлайна)
                'picture': picture_url,
                'product_type': product_type_name,
                'weight': weight,
                'depts': depts,
                'fabric_blocked': fabric_blocked,  # True = ткань ещё не получена
                'fabric_available_day': fabric_available_day,  # День доступности (0 = сейчас)
            })

    # --- load_factor: насколько слайдер "Загрузка цехов" доминирует ---
    # load_factor = 0.0 → чистый вес (сроки/прогресс/обр.связь решают)
    # load_factor = 1.0 → максимальная эффективность конвейера (downstream_path_score)
    # Считается как доля K_загрузка в сумме всех коэффициентов.
    from plan.models import AiPlanConfig
    _cfg = AiPlanConfig.objects.filter(pk=1).first()
    k_load = _cfg.weight_k_dept_load if _cfg else 25
    _k_revenue = _cfg.weight_k_revenue if _cfg else 0
    k_sum = (
        (_cfg.weight_k_deadline if _cfg else 25) +
        (100 - _k_revenue) +  # k_progress = инверсия k_revenue
        k_load +
        (_cfg.weight_k_feedback if _cfg else 25) +
        _k_revenue
    )
    load_factor = k_load / k_sum if k_sum > 0 else 0.25

    # --- downstream_path_score: раннее питание бутылочного горлышка ---
    #
    # ПРОБЛЕМА: если все быстрые заказы (подушки, кресла) идут первыми,
    #   они проскакивают мимо Столярки/Малярки и загружают Обивку на 4-5 дней.
    #   Потом Обивка ГОЛОДАЕТ 200+ дней, ожидая медленные заказы из Малярки.
    #   Малярка — бутылочное горлышко (100% загрузка на весь горизонт).
    #
    # РЕШЕНИЕ: при высоком load_factor (слайдер "Загрузка цехов") сортируем
    #   стартовые цеха так, чтобы заказы с ДЛИННЫМ путём шли ПЕРВЫМИ.
    #   Это запускает Столярку→Малярку раньше, и Обивка начинает получать
    #   от неё раньше. Быстрые заказы (подушки) идут позже, но они быстро
    #   долетают до Обивки и заполняют "лёгкие" дни пока Малярка капает.
    #
    # Формула для стартовых цехов:
    #   score = weight × (1 - load_factor) + downstream_path_score × load_factor
    #   weight доминирует при низком load_factor (сроки/прогресс важнее)
    #   downstream_path_score доминирует при высоком (загрузка цехов важнее)
    #
    # downstream_path_score: нормализованный 0-1000, длинный путь = высокий скор.
    # Пример: Диван (Столярка→Малярка→Обивка = 170ч) → скор ~1000
    #         Подушка (Крой→Пошив→Обивка = 12ч) → скор ~70

    def calc_path_hours(order, dept):
        """Рекурсивно посчитать САМЫЙ ДЛИННЫЙ путь от цеха до конца графа.

        Для каждого узла графа считаем: часы в этом цехе + max(часы по всем
        исходящим путям). Берём max, а не sum, потому что параллельные пути
        идут ОДНОВРЕМЕННО — bottleneck определяется самым медленным.

        Пример для Бокса (34 шт), схема "Полный цикл":
          Пила: 17ч → Сборка: 85ч → [конец пути = 102ч]
          Лазер: 20.4ч → Сборка: уже учтён
          Крой: 15.3ч → Пошив: 20.4ч → [конец пути = 35.7ч]
          Столярка: 85ч → Малярка: 85ч → [конец пути = 170ч]
          ППУ: 20.4ч → [конец пути = 20.4ч]

        Результат: max(102, 35.7, 170, 20.4) = 170ч (Столярка→Малярка — bottleneck)

        Args:
            order: данные заказа с 'depts' и 'product_type'
            dept: цех, от которого считаем путь вниз

        Returns:
            Часы самого длинного пути от dept до конца графа.
            Включает часы самого dept.
        """
        pt = order.get('product_type', '')
        wf = workflows.get(pt)

        # Часы этого заказа в текущем цехе (0 если заказ не проходит через этот цех)
        dept_info = order['depts'].get(dept)
        my_hours = dept_info['hours'] if dept_info else 0

        if not wf:
            return my_hours

        # Куда передаёт этот цех? (например Пила → ["Сборка"])
        next_depts = wf.get(dept, [])
        if not next_depts:
            return my_hours

        # Считаем самый длинный путь через все исходящие рёбра.
        # Берём max потому что параллельные пути идут одновременно —
        # bottleneck = самый медленный из них.
        max_downstream = 0
        for nd in next_depts:
            if nd in ('Готово',):
                continue
            # Рекурсивно считаем путь от следующего цеха
            path = calc_path_hours(order, nd)
            if path > max_downstream:
                max_downstream = path

        return my_hours + max_downstream

    # --- Рассчитать downstream_path_score для каждого заказа ---
    # Один скор на весь заказ. Все стартовые цеха сортируют одинаково.
    # Длинный путь = высокий скор → медленные заказы идут ПЕРВЫМИ при высоком load_factor.
    for order in order_dept_data:
        pt = order.get('product_type', '')
        wf = workflows.get(pt)

        if wf:
            # Находим стартовые цеха из графа (те, куда указывает "Старт")
            start_depts_list = wf.get('Старт', [])

            # downstream_path = самый длинный путь через ВСЕ параллельные цепочки.
            # Пример: Старт → [Пила, Лазер, Крой, ППУ, Столярка]
            #   Путь через Пилу→Сборку = 102ч
            #   Путь через Столярку→Малярку = 170ч
            #   downstream_path = max(102, ..., 170) = 170ч
            downstream = 0
            for sd in start_depts_list:
                if sd in ('Готово',):
                    continue
                path = calc_path_hours(order, sd)
                if path > downstream:
                    downstream = path
            order['downstream_hours'] = downstream
        else:
            # Нет графа — просто сумма часов по всем цехам
            order['downstream_hours'] = sum(info['hours'] for info in order['depts'].values())

    # Нормализуем downstream_path к шкале 0-1000 (как weight).
    # НЕ инвертируем: длинный путь → высокий скор → приоритет при высоком load_factor.
    # Это ПРОТИВОПОЛОЖНОСТЬ старого bottleneck_score, который ставил быстрые заказы первыми.
    # Причина: бутылочное горлышко (Малярка) нужно кормить РАНО, иначе зависимые цеха
    # (Обивка) голодают сотни дней пока Малярка доделывает.
    max_dh = max((o['downstream_hours'] for o in order_dept_data), default=1) or 1
    for order in order_dept_data:
        # Прямая пропорция: downstream=max → скор=1000 (самый длинный путь, первый)
        # downstream=0 → скор=0 (мгновенный, последний при высоком load_factor)
        order['downstream_path_score'] = (order['downstream_hours'] / max_dh) * 1000

    # --- Price density: "плотность денег" — сколько рублей приносит час работы ---
    #
    # Заказы с высокой плотностью (много денег, быстро делаются) получают приоритет,
    # чтобы максимизировать выручку в первые 30 дней.
    # Формула: price_density = сумма цен ВСЕХ позиций заказа / downstream_hours
    # Нормализуем к шкале 0-1000.
    #
    # Почему считаем по заказу а не по позиции:
    #   Заказ завершён когда ВСЕ позиции готовы. Если в заказе на 2М есть 1 диван
    #   (170ч пути) и 5 подушек (12ч пути) — bottleneck = 170ч.
    #   price_density = 2М/170ч = 11765 ₽/ч. Дешёвый длинный заказ = низкая плотность.
    #
    # Группируем позиции по заказу — считаем суммарную стоимость и макс. путь.
    from collections import defaultdict as _defaultdict
    _order_total_price = _defaultdict(float)
    _order_max_path = _defaultdict(float)
    for order in order_dept_data:
        oid = order.get('order_db_id') or order.get('series_id')
        _order_total_price[oid] += order.get('price', 0)
        dh = order.get('downstream_hours', 0)
        if dh > _order_max_path[oid]:
            _order_max_path[oid] = dh

    # Рассчитываем price_density для каждого заказа
    _order_density = {}
    for oid in _order_total_price:
        path = _order_max_path[oid]
        if path > 0:
            _order_density[oid] = _order_total_price[oid] / path
        else:
            # Нулевой путь = мгновенный заказ, максимальная плотность
            _order_density[oid] = _order_total_price[oid] * 100 if _order_total_price[oid] > 0 else 0

    # Нормализуем к 0-1000
    max_density = max(_order_density.values(), default=1) or 1
    for order in order_dept_data:
        oid = order.get('order_db_id') or order.get('series_id')
        order['price_density_score'] = (_order_density.get(oid, 0) / max_density) * 1000

    # Приоритетные заказы первые (базовая сортировка по весу)
    order_dept_data.sort(key=lambda x: x['weight'], reverse=True)

    # --- Топологическая сортировка цехов ---
    # Чтобы при раскладке сначала обработать Пилу/Лазер, потом Сборку,
    # и produced_by_day был уже заполнен для зависимостей.

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

    # --- Раскладка заказов по дням (ПОТОКОВАЯ модель) ---
    #
    # Ключевое отличие от "блочной" модели:
    #   Блочная: Сборка ждёт пока Пила закончит ВСЕ 34 шт, потом начинает.
    #   Потоковая: Пила сделала 16 шт за день 1 → Сборка может собирать эти 16 уже в день 2,
    #              пока Пила допиливает остальные 18 в день 2.
    #
    # Это отражает реальный конвейер на фабрике: штуки передаются между цехами
    # по мере готовности, а не ждут всю партию.
    #
    # Структуры данных:
    #   produced_by_day[series_id][dept][day] = сколько ШТУК выпущено этим цехом К КОНЦУ этого дня
    #     (кумулятивно, т.е. день 0: 16, день 1: 32, день 2: 34)
    #     Используется для потоковой передачи — зависимый цех проверяет сколько штук
    #     предшественники уже выпустили, и берёт минимум по всем предшественникам.
    #
    #   dept_state[dept] = массив дней [{orders: [...], hours: float}]
    #     Рабочее расписание каждого цеха — сколько часов занято в каждый день и какие заказы.

    # Кумулятивный выпуск: сколько штук заказа готово к концу каждого дня в каждом цехе.
    # Пример: produced_by_day['SID-123']['Пила'] = {0: 16, 1: 32, 2: 34}
    #   → к концу дня 0 Пила сделала 16 из 34, к концу дня 1 — 32, к концу дня 2 — все 34.
    produced_by_day = {}

    # Состояние каждого цеха: массив дней с заказами и часами
    dept_state = {dept: [] for dept in departments}

    # Трекинг последнего product_id обработанного в каждом цехе (для настила)
    dept_last_product = {dept: None for dept in departments}

    # Трекинг последнего product_type в каждом цехе (для setup time / переключения).
    # Отличие от dept_last_product: настил работает по product_id (одинаковые изделия),
    # setup time работает по product_type (одинаковый ТИП = не нужна переналадка).
    dept_last_type = {dept: None for dept in departments}

    # Order-aware grouping: трекинг какие заказы (order_db_id) уже запущены в каждом цехе.
    # Если одна позиция заказа уже обрабатывается/обработана — другие позиции того же
    # заказа получают бонус +25% к скору. Цель: заказ завершается быстрее целиком,
    # а выручка считается по заказу (все позиции готовы → деньги).
    dept_started_orders = {dept: set() for dept in departments}

    def get_batch_bonus(order, dept):
        """Получить коэффициент настила для заказа в цехе.
        Настил привязан к цеху (не к типу изделия).
        Возвращает bonus (0.0-0.5) если последний заказ в цехе — то же изделие."""
        bonus = batch_bonuses.get(dept, 0)
        if bonus <= 0:
            return 0
        if dept_last_product[dept] == order.get('product_id'):
            return bonus
        return 0

    def get_setup_hours(order, dept):
        """Получить время переключения (в часах) при смене типа изделия в цехе.

        Глобальное значение: одно setup_minutes на все цеха.
        Если предыдущий заказ в цехе был того же типа — 0.
        Если тип сменился — возвращаем global_setup_minutes в часах.
        Если цех ещё пустой (dept_last_type = None) — тоже 0.
        """
        pt = order.get('product_type', '')
        last_type = dept_last_type[dept]
        if last_type is None or last_type == pt:
            return 0
        return global_setup_minutes / 60.0  # Переводим минуты → часы

    def get_available_units(order, dept, day):
        """Определить сколько ШТУК заказа доступно для цеха на данный день.

        Потоковая логика: зависимый цех (Сборка) может обрабатывать столько штук,
        сколько ВСЕ его предшественники (Пила, Лазер) уже выпустили к ПРЕДЫДУЩЕМУ дню.

        Берём минимум по всем предшественникам — потому что для сборки одного изделия
        нужны комплектующие от КАЖДОГО предшественника.

        Пример:
          Заказ 34 шт. Сборка зависит от Пилы и Лазера.
          К концу дня 1: Пила выпустила 16, Лазер выпустил 34 (Лазер быстрее).
          → Сборка в день 2 может собрать min(16, 34) = 16 шт.
          К концу дня 2: Пила выпустила 32, Лазер 34.
          → Сборка в день 3 может собрать min(32, 34) = 32 шт.
          Из них Сборка уже собрала 16 в день 2, значит в день 3 доступно 32 - 16 = 16 новых.

        Args:
            order: данные заказа (series_id, product_type)
            dept: цех, для которого считаем доступность
            day: день, НА который планируем работу

        Returns:
            Количество штук, доступных для обработки в этот день.
            None если нет зависимостей (цех первый в цепочке — доступно всё).
        """
        sid = order['series_id']
        pt = order['product_type']
        wf = workflows.get(pt)
        if not wf:
            # Нет графа зависимостей — цех работает независимо, лимита нет
            return None

        # Инвертируем граф: "Пила → Сборка" → "Сборка зависит от Пилы"
        deps = _invert_workflow(wf)
        dep_depts = deps.get(dept, [])
        if not dep_depts:
            # Нет предшественников (это стартовый цех типа Пилы) — лимита нет
            return None

        # Фильтруем предшественников: учитываем только те цеха, через которые
        # этот заказ РЕАЛЬНО проходит (есть в depts). Если заказ не проходит через Пилу
        # (нулевой норматив), Пила не должна блокировать Сборку.
        order_depts = set(order['depts'].keys())
        actual_deps = [d for d in dep_depts if d in order_depts]
        if not actual_deps:
            # Все предшественники по графу не участвуют в этом заказе — лимита нет
            return None

        # Считаем сколько штук доступно от КАЖДОГО предшественника к ПРЕДЫДУЩЕМУ дню.
        # Берём предыдущий день (day - 1), потому что штуки выпущенные сегодня
        # в Пиле поступят в Сборку только ЗАВТРА (передача в конце дня).
        prev_day = day - 1
        if prev_day < 0:
            # День 0 — предшественники ещё ничего не выпустили
            return 0

        min_produced = None
        for dep_dept in actual_deps:
            # Сколько штук dep_dept выпустил к концу prev_day?
            dep_produced = 0
            if sid in produced_by_day and dep_dept in produced_by_day[sid]:
                # Ищем ближайший день <= prev_day с записью выпуска
                prod_days = produced_by_day[sid][dep_dept]
                for d in range(prev_day, -1, -1):
                    if d in prod_days:
                        dep_produced = prod_days[d]
                        break

            # Минимум по всем предшественникам — нужны комплектующие от КАЖДОГО
            if min_produced is None:
                min_produced = dep_produced
            else:
                min_produced = min(min_produced, dep_produced)

        return min_produced if min_produced is not None else 0

    # --- Определяем какие цеха зависимые (имеют предшественников) ---
    # Зависимые цеха: Сборка, Обивка, Упаковка и т.д. — те, у которых есть входящие
    # рёбра в графе зависимостей. Для них используется день-по-день раскладка.
    # Стартовые цеха: Пила, Лазер, Крой и т.д. — обрабатывают заказы последовательно.
    dependent_depts = set()
    for wf in workflows.values():
        inverted = _invert_workflow(wf)
        for dept_name, deps_list in inverted.items():
            if deps_list:
                dependent_depts.add(dept_name)

    # --- Вспомогательная функция: записать produced_by_day ---
    def _record_production(sid, dept, day, units_produced_total):
        """Записать кумулятивный выпуск для потоковой передачи.
        Зависимые цеха проверяют эти данные чтобы узнать сколько штук
        предшественники уже выпустили."""
        if sid not in produced_by_day:
            produced_by_day[sid] = {}
        if dept not in produced_by_day[sid]:
            produced_by_day[sid][dept] = {}
        produced_by_day[sid][dept][day] = units_produced_total

    # --- Вспомогательная функция: разложить часы заказа в день ---
    def _fill_order_in_day(order, dept, day, hours_this_batch, hours_per_unit, cap):
        """Заполнить один день работой над заказом.
        Возвращает (take, units_today) — сколько часов взято и штук обработано.
        Возвращает (0, 0) если день полностью занят."""
        # Создать день если его ещё нет
        while len(dept_state[dept]) <= day:
            dept_state[dept].append({'orders': [], 'hours': 0})

        day_data = dept_state[dept][day]
        day_free = cap - day_data['hours']

        if day_free <= 0:
            return 0, 0

        # Сколько часов реально возьмём: минимум из (свободное время, доступная работа)
        take = min(hours_this_batch, day_free)

        # Сколько штук обрабатывается именно в ЭТОТ день
        units_today = max(1, round(take / hours_per_unit))

        # Добавить заказ в ячейку дня
        day_data['orders'].append({
            'name': order['name'],
            'order': order['order'],
            'picture': order['picture'],
            'count': units_today,
            'product_id': order.get('product_id'),
            'order_id': order.get('order_db_id'),
        })
        day_data['hours'] += take
        return take, units_today

    # --- Обходим цеха в топологическом порядке ---
    # Сначала стартовые цеха (Пила, Лазер) — чтобы заполнить produced_by_day,
    # потом зависимые (Сборка) — которые используют эти данные для потоковой передачи.
    MAX_DAYS = 365

    # Доля выручки в балансе (0.0-1.0). Управляет силой price_density бонуса.
    # При k_revenue=0 → _revenue_factor=0 → price density не влияет на сортировку.
    # При k_revenue=100 → _revenue_factor=1.0 → максимальное влияние плотности денег.
    _revenue_factor = _k_revenue / 100.0

    for dept in topo_depts:
        cap = capacity.get(dept, WORK_HOURS)
        is_dependent = dept in dependent_depts

        if not is_dependent:
            # ═══════════════════════════════════════════════════════════════
            # СТАРТОВЫЕ ЦЕХА (Пила, Лазер, Крой, ППУ, Столярка)
            # Обрабатывают заказы последовательно в порядке приоритета.
            #
            # Сортировка: blend weight + downstream_path_score по load_factor.
            #   score = weight × (1 - load_factor) + downstream_path_score × load_factor
            #
            # При низком load_factor (сроки/прогресс важнее):
            #   → чистый weight, как раньше
            #
            # При высоком load_factor (загрузка цехов важнее):
            #   → заказы с ДЛИННЫМ путём (через Столярку→Малярку) идут ПЕРВЫМИ.
            #   Это запускает бутылочное горлышко (Малярку) раньше, и зависимые
            #   цеха (Обивка) начинают получать работу раньше.
            #   Быстрые заказы (подушки) уходят в конец — они быстро долетят
            #   до Обивки и заполнят лёгкие дни пока Малярка капает.
            #
            # Все стартовые цеха используют ОДИНАКОВУЮ формулу (один скор на заказ),
            # чтобы все пути были синхронизированы.
            # ═══════════════════════════════════════════════════════════════
            dept_orders = [o for o in order_dept_data if dept in o['depts']]
            remaining_orders = set(range(len(dept_orders)))  # Индексы необработанных заказов

            # Жадный алгоритм: после каждого заказа пересчитываем приоритеты
            # с учётом настила, price density и order-aware grouping.
            #
            # Формула скоринга стартовых цехов:
            #   base = weight × (1-lf) + downstream_path × lf
            #   + price_density бонус: при k_revenue > 0 добавляем плотность денег
            #   × настил бонус: +20% если то же изделие (batch continuation)
            #   × order grouping бонус: +25% если другая позиция того же заказа
            #     уже обрабатывается в этом цехе (завершить заказ быстрее → выручка)
            # Определяем заказы (order_db_id) у которых есть хотя бы одна
            # позиция с заблокированной тканью — такие заказы депиоритизируем.
            _orders_with_fabric_wait = set()
            for o in dept_orders:
                if o.get('fabric_blocked'):
                    oid = o.get('order_db_id')
                    if oid:
                        _orders_with_fabric_wait.add(oid)

            while remaining_orders:
                # Пересортировка с учётом текущего состояния цеха
                best_idx = max(remaining_orders, key=lambda i: (
                    # Базовый скор: blend weight + downstream_path по load_factor
                    (dept_orders[i]['weight'] * (1 - load_factor) +
                     dept_orders[i].get('downstream_path_score', 0) * load_factor
                     + dept_orders[i].get('price_density_score', 0) * _revenue_factor * 0.3)
                    # Настил бонус: +20% если то же изделие что и предыдущий
                    * (1.2 if dept_last_product[dept] == dept_orders[i].get('product_id') and
                       batch_bonuses.get(dept, 0) > 0 else 1.0)
                    # Order grouping бонус: +25% если другая позиция того же заказа
                    * (1.25 if dept_orders[i].get('order_db_id') in dept_started_orders[dept] else 1.0)
                    # Ткань: позиция заблокирована → скор почти 0 (уходит в конец)
                    * (0.01 if dept_orders[i].get('fabric_blocked') else 1.0)
                    # Заказ содержит позицию без ткани → депиоритизация -30%
                    * (0.7 if dept_orders[i].get('order_db_id') in _orders_with_fabric_wait
                       and not dept_orders[i].get('fabric_blocked') else 1.0)
                ))
                remaining_orders.remove(best_idx)
                order = dept_orders[best_idx]

                info = order['depts'][dept]
                hours_left = info['hours']
                remaining = info['remaining']
                sid = order['series_id']

                # Запомнить что этот заказ (Order) запущен в этом цехе
                oid = order.get('order_db_id')
                if oid:
                    dept_started_orders[dept].add(oid)

                # Настил: если то же изделие что и предыдущий — уменьшаем часы
                bonus = get_batch_bonus(order, dept)
                if bonus > 0:
                    hours_left = hours_left * (1 - bonus)

                # Setup time: время переключения при смене типа изделия.
                setup_hours = get_setup_hours(order, dept)
                hours_left += setup_hours

                hours_per_unit = hours_left / remaining if remaining > 0 else 1
                units_produced_total = 0
                # Ткань заблокирована → начинаем с дня доступности ткани
                day = order.get('fabric_available_day', 0)

                while hours_left > 0 and day < MAX_DAYS:
                    take, units_today = _fill_order_in_day(
                        order, dept, day, hours_left, hours_per_unit, cap
                    )
                    if take <= 0:
                        day += 1
                        continue

                    hours_left -= take
                    units_produced_total += units_today
                    _record_production(sid, dept, day, units_produced_total)

                    if hours_left > 0:
                        day += 1

                # Обновить last_product и last_type для настила и переключения
                dept_last_product[dept] = order.get('product_id')
                dept_last_type[dept] = order.get('product_type')

        else:
            # ═══════════════════════════════════════════════════════════════
            # ЗАВИСИМЫЕ ЦЕХА (Сборка, Обивка, Упаковка)
            # День-по-день раскладка: каждый день берём ВСЁ что готово.
            # Это устраняет дырки — цех не ждёт один высокоприоритетный заказ,
            # пока другие уже доступны.
            #
            # Сортировка: blend weight + downstream_path + readiness бонус.
            # Та же формула что в стартовых (weight × (1-lf) + downstream × lf),
            # плюс множитель readiness (+30% за готовые детали).
            # При высоком load_factor: длинные заказы + готовые детали → первые.
            # При низком: чистый weight (сроки/прогресс).
            # ═══════════════════════════════════════════════════════════════

            # Инициализация состояния для каждого заказа в этом цехе
            # remaining_state: {series_id: {hours_left, remaining, hours_per_unit, units_produced}}
            remaining_state = {}
            dept_order_list = []
            for order in order_dept_data:
                if dept not in order['depts']:
                    continue
                info = order['depts'][dept]
                sid = order['series_id']
                hours_left = info['hours']
                remaining = info['remaining']
                remaining_state[sid] = {
                    'hours_left': hours_left,
                    'remaining': remaining,
                    'hours_per_unit': hours_left / remaining if remaining > 0 else 1,
                    'units_produced': 0,
                }
                dept_order_list.append(order)

            day = 0
            while day < MAX_DAYS:
                # Проверяем есть ли вообще незавершённые заказы
                has_work = any(
                    remaining_state[o['series_id']]['hours_left'] > 0
                    for o in dept_order_list
                )
                if not has_work:
                    break

                # Создать день если его ещё нет
                while len(dept_state[dept]) <= day:
                    dept_state[dept].append({'orders': [], 'hours': 0})

                day_data = dept_state[dept][day]
                day_free = cap - day_data['hours']
                if day_free <= 0:
                    day += 1
                    continue

                # --- Пересортировка заказов на ЭТОТ день ---
                # Для каждого заказа считаем: сколько штук доступно от предшественников?
                scorable = []
                for order in dept_order_list:
                    sid = order['series_id']
                    state = remaining_state[sid]
                    if state['hours_left'] <= 0:
                        continue

                    # Ткань ещё не получена — пропускаем до дня доступности
                    if order.get('fabric_blocked') and day < order.get('fabric_available_day', 0):
                        continue

                    available = get_available_units(order, dept, day)
                    if available is not None:
                        can_do = available - state['units_produced']
                        if can_do <= 0:
                            # Предшественники ещё не выпустили новых штук — пропускаем
                            continue
                        readiness = can_do  # Сколько штук готово к обработке
                    else:
                        can_do = state['remaining']
                        readiness = can_do

                    scorable.append((order, can_do, readiness))

                if not scorable:
                    # Ни один заказ не готов сегодня — переходим на завтра
                    day += 1
                    continue

                # Сортировка зависимых цехов:
                #   base = weight × (1-lf) + downstream_path × lf + price_density бонус
                #   × readiness бонус (+30% за готовые детали)
                #   × настил бонус (+20% за то же изделие)
                #   × order grouping бонус (+25% если другая позиция того же заказа
                #     уже в этом цехе — чтобы заказ завершился быстрее целиком)
                max_readiness = max(r for _, _, r in scorable) or 1
                scorable.sort(
                    key=lambda x: (
                        # Базовый приоритет: blend weight + downstream_path + price density
                        (x[0]['weight'] * (1 - load_factor) +
                         x[0].get('downstream_path_score', 0) * load_factor
                         + x[0].get('price_density_score', 0) * _revenue_factor * 0.3)
                        # Readiness бонус: до +30% от базового скора
                        * (1 + 0.3 * x[2] / max_readiness * load_factor)
                        # Настил бонус: +20% если то же изделие что и предыдущий в цехе
                        * (1.2 if dept_last_product[dept] == x[0].get('product_id') and
                           batch_bonuses.get(dept, 0) > 0 else 1.0)
                        # Order grouping бонус: +25% если другая позиция того же заказа
                        # уже обрабатывается в этом цехе
                        * (1.25 if x[0].get('order_db_id') in dept_started_orders[dept] else 1.0)
                    ),
                    reverse=True,
                )

                # --- Заполняем день заказами по приоритету ---
                for order, can_do, readiness in scorable:
                    sid = order['series_id']
                    state = remaining_state[sid]

                    if day_free <= 0:
                        break

                    # Запомнить что этот заказ (Order) запущен в этом цехе
                    oid = order.get('order_db_id')
                    if oid:
                        dept_started_orders[dept].add(oid)

                    # Setup time: при смене типа изделия добавляем время переключения.
                    # Считаем один раз при первом взятии заказа (не каждый день).
                    if not state.get('setup_applied'):
                        setup_hours = get_setup_hours(order, dept)
                        if setup_hours > 0:
                            state['hours_left'] += setup_hours
                        state['setup_applied'] = True

                    # Настил: уменьшаем hours_per_unit если то же изделие
                    bonus = get_batch_bonus(order, dept)
                    hours_per_unit = state['hours_per_unit'] * (1 - bonus) if bonus > 0 else state['hours_per_unit']

                    # Часы доступные по потоковой модели
                    hours_for_available = can_do * hours_per_unit
                    hours_this_batch = min(state['hours_left'], hours_for_available)

                    take, units_today = _fill_order_in_day(
                        order, dept, day, hours_this_batch, hours_per_unit, cap
                    )
                    if take <= 0:
                        continue

                    state['hours_left'] -= take
                    state['units_produced'] += units_today
                    _record_production(sid, dept, day, state['units_produced'])

                    # Обновить last_product и last_type для настила и переключения
                    dept_last_product[dept] = order.get('product_id')
                    dept_last_type[dept] = order.get('product_type')

                    # Обновить свободное время дня
                    day_free = cap - dept_state[dept][day]['hours']

                day += 1

    # --- Формирование результата ---

    total_days = max((len(days) for days in dept_state.values()), default=1)

    # Маппинг рабочий день → реальная дата (пропускаем сб/вс)
    from datetime import date as _date_cls, timedelta
    today = _date_cls.today()
    work_day_dates = []  # work_day_dates[i] = реальная дата для рабочего дня i
    current_date = today
    for _ in range(total_days):
        # Пропускаем выходные: сб=5, вс=6
        while current_date.weekday() in (5, 6):
            current_date += timedelta(days=1)
        work_day_dates.append(current_date)
        current_date += timedelta(days=1)

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
                    'date': work_day_dates[d].isoformat() if d < len(work_day_dates) else None,
                })
            else:
                row.append({
                    'orders': [], 'load': 'empty', 'hours': 0,
                    'date': work_day_dates[d].isoformat() if d < len(work_day_dates) else None,
                })
        grid[dept] = row

    # --- Прогноз выручки по 30-дневным периодам ---
    # Для каждой позиции (order_product) определяем последний день появления в grid.
    # Заказ (Order) считается полностью завершённым, когда ВСЕ его позиции
    # прошли все цеха (последний день последней позиции).
    # Группируем по 30-дневным периодам и суммируем стоимости.

    # Шаг 1: Для каждой позиции найти последний день в расписании.
    # series_id → последний день в любом цехе
    op_last_day = {}
    for order_data in order_dept_data:
        sid = order_data['series_id']
        # Ищем по всем цехам — последний день, когда эта позиция упоминается
        if sid in produced_by_day:
            for dept_days in produced_by_day[sid].values():
                if dept_days:
                    max_day = max(dept_days.keys())
                    op_last_day[sid] = max(op_last_day.get(sid, 0), max_day)

    # Шаг 2: Группируем позиции по Order (order_db_id).
    # Для каждого заказа: все позиции, их цены, последние дни.
    from collections import defaultdict
    order_positions = defaultdict(list)
    for od in order_dept_data:
        oid = od.get('order_db_id')
        if oid:
            order_positions[oid].append({
                'series_id': od['series_id'],
                'price': od['price'],
                'product_type': od['product_type'],
                'last_day': op_last_day.get(od['series_id'], 0),
                'order_number': od['order'],
                'deadline_days_left': od.get('deadline_days_left'),
            })

    # Шаг 3: Заказ завершён когда ВСЕ его позиции завершены.
    # Дата завершения заказа = max(last_day) по всем его позициям.
    completed_orders = []
    for oid, positions in order_positions.items():
        # Пропускаем если какая-то позиция не попала в расписание
        if not all(p['last_day'] > 0 or p['series_id'] in op_last_day for p in positions):
            continue
        completion_day = max(p['last_day'] for p in positions)
        total_price = sum(p['price'] for p in positions)
        # Собираем типы изделий для сводки
        type_counts = defaultdict(int)
        for p in positions:
            pt = p['product_type'] or 'Другое'
            type_counts[pt] += 1

        # Статус по дедлайну: сравниваем день завершения с дедлайном.
        # Дедлайн заказа = минимальный дедлайн среди всех его позиций (самый жёсткий).
        # deadline_days_left — дней от сегодня до дедлайна (отрицательное = просрочен).
        # completion_day — через сколько дней заказ будет готов (от сегодня).
        # Если completion_day <= deadline_days_left → в срок или раньше.
        deadlines = [p['deadline_days_left'] for p in positions if p['deadline_days_left'] is not None]
        if deadlines:
            order_deadline = min(deadlines)  # Самый жёсткий дедлайн
            diff = completion_day - order_deadline  # >0 = опоздание, <0 = раньше, 0 = в срок
            if diff > 1:
                deadline_status = 'late'       # Опоздание (>1 дня после дедлайна)
            elif diff < -1:
                deadline_status = 'early'      # Раньше срока (>1 дня до дедлайна)
            else:
                deadline_status = 'on_time'    # В срок (±1 день)
        else:
            deadline_status = 'no_deadline'     # Без дедлайна

        completed_orders.append({
            'order_number': positions[0]['order_number'],
            'completion_day': completion_day,
            'total_price': total_price,
            'type_counts': dict(type_counts),
            'deadline_status': deadline_status,
        })

    # Шаг 4: Группируем по 30-дневным периодам (рабочие дни → реальные даты)
    PERIOD_DAYS = 30
    num_periods = (total_days + PERIOD_DAYS - 1) // PERIOD_DAYS
    forecast_periods = []
    for period_idx in range(num_periods):
        day_from = period_idx * PERIOD_DAYS
        day_to = min((period_idx + 1) * PERIOD_DAYS - 1, total_days - 1)

        # Реальные даты начала и конца периода
        date_from = work_day_dates[day_from] if day_from < len(work_day_dates) else None
        date_to = work_day_dates[day_to] if day_to < len(work_day_dates) else None

        # Заказы завершающиеся в этом периоде
        period_orders = [
            o for o in completed_orders
            if day_from <= o['completion_day'] <= day_to
        ]
        period_sum = sum(o['total_price'] for o in period_orders)
        orders_count = len(period_orders)

        # Агрегация типов мебели за период
        period_types = defaultdict(int)
        for o in period_orders:
            for pt, cnt in o['type_counts'].items():
                period_types[pt] += cnt

        # Статистика по дедлайнам: сколько заказов опоздает / в срок / раньше
        late_count = sum(1 for o in period_orders if o['deadline_status'] == 'late')
        on_time_count = sum(1 for o in period_orders if o['deadline_status'] == 'on_time')
        early_count = sum(1 for o in period_orders if o['deadline_status'] == 'early')
        no_deadline_count = sum(1 for o in period_orders if o['deadline_status'] == 'no_deadline')

        forecast_periods.append({
            'day_from': day_from,
            'day_to': day_to,
            'date_from': date_from.isoformat() if date_from else None,
            'date_to': date_to.isoformat() if date_to else None,
            'total_sum': round(period_sum, 2),
            'orders_count': orders_count,
            'product_types': dict(period_types),
            'late': late_count,
            'on_time': on_time_count,
            'early': early_count,
            'no_deadline': no_deadline_count,
        })

    # Убираем пустые периоды в конце (после последнего заказа)
    while forecast_periods and forecast_periods[-1]['orders_count'] == 0:
        forecast_periods.pop()

    # Подсчёт заказов, уже просроченных на сегодня (дедлайн в прошлом).
    # Это НЕ прогноз, а факт — сколько заказов уже не успели к сроку.
    from datetime import date as _today_cls
    already_overdue = 0
    already_overdue_sum = 0.0
    for oid, positions in order_positions.items():
        deadlines = [p['deadline_days_left'] for p in positions if p['deadline_days_left'] is not None]
        if deadlines and min(deadlines) < 0:
            already_overdue += 1
            already_overdue_sum += sum(p['price'] for p in positions)

    return {
        'departments': departments,
        'total_days': total_days,
        'grid': grid,
        'dates': [d.isoformat() for d in work_day_dates],  # Реальные даты рабочих дней
        'forecast_periods': forecast_periods,
        'already_overdue': already_overdue,
        'already_overdue_sum': round(already_overdue_sum, 2),
    }


def _build_grid_summary(chart_data):
    """Построить краткую сводку по графику загрузки для GPT.

    Для каждого цеха считаем:
    - loaded_days: сколько дней с работой
    - overloaded_days: сколько дней с перегрузкой
    - runs_out_day: через сколько дней цех останется без работы
    - is_terminal: терминальный ли цех (последний в графе, например Упаковка)
    - gap_days: количество пустых дней ПОСЕРЕДИНЕ загруженных (дырки из-за ожидания)

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

        # Количество "дырок" — пустых дней МЕЖДУ загруженными.
        # Это простой из-за ожидания предшественников по графу зависимостей.
        # Пример: [full, full, empty, empty, full, full, empty] → gap_days=2 (два пустых посередине)
        # Пустые дни в конце — это не дырки, а просто конец работы.
        gap_days = 0
        if loaded_days > 0:
            # Найти последний загруженный день
            last_loaded = 0
            for i in range(len(days) - 1, -1, -1):
                if days[i]['load'] != 'empty':
                    last_loaded = i
                    break
            # Считать пустые дни до last_loaded (это именно дырки-ожидания)
            for i in range(last_loaded):
                if days[i]['load'] == 'empty':
                    gap_days += 1

        summary[dept] = {
            'loaded_days': loaded_days,
            'overloaded_days': overloaded_days,
            'runs_out_day': runs_out,
            'is_terminal': dept in terminal_depts,
            'gap_days': gap_days,
        }
    return summary


def _calc_equalizer_suggestions(grid_summary, dept_dependencies, target_loads, dept_summary):
    """Рассчитать рекомендуемые значения эквалайзера на основе дырок в графике.

    Логика:
    1. Для каждого цеха с дырками (gap_days > 0) — это простой из-за ожидания предшественников.
    2. Чтобы закрыть дырки, нужно чтобы предшественники отдавали работу быстрее.
    3. Увеличение эквалайзера предшественника → он притягивает больше заказов → быстрее передаёт.
    4. Рекомендуемое увеличение = текущий_эквалайзер + gap_days зависимого цеха
       (но не больше 14 — максимум слайдера).

    Также учитываем перегрузку: если цех перегружен (факт > цель×2), можно
    уменьшить его эквалайзер, чтобы снять штраф и перераспределить.

    Returns: list of {dept, current, suggested, reason, dependent_dept, gap_days}
    """
    suggestions = []
    seen_depts = set()  # Не дублировать рекомендации для одного предшественника

    for dept, info in grid_summary.items():
        gap_days = info.get('gap_days', 0)
        if gap_days < 2:
            # Меньше 2 дырок — не критично, не рекомендуем
            continue
        if info.get('is_terminal'):
            # Терминальные цеха всегда ждут — это штатно
            continue

        # Кого этот цех ждёт?
        predecessors = dept_dependencies.get(dept, [])
        if not predecessors:
            continue

        for pred in predecessors:
            if pred in seen_depts:
                continue

            pred_target = target_loads.get(pred, 7)
            pred_info = dept_summary.get(pred, {})
            pred_days = pred_info.get('days_needed', 0)

            # Рекомендация: увеличить эквалайзер предшественника на кол-во дырок зависимого,
            # но ограничить 14 (максимум слайдера) и не рекомендовать если уже >= 14
            suggested = min(pred_target + gap_days, 14)
            if suggested <= pred_target:
                continue

            seen_depts.add(pred)
            suggestions.append({
                'dept': pred,
                'current': pred_target,
                'suggested': suggested,
                'dependent_dept': dept,
                'gap_days': gap_days,
                'pred_fact': round(pred_days, 1),
                'reason': (
                    f'{dept} простаивает {gap_days} дн. из-за ожидания {pred}. '
                    f'Увеличить эквалайзер {pred} с {pred_target} до {suggested} дн. — '
                    f'{pred} получит бонус к приоритету заказов и быстрее передаст работу в {dept}.'
                ),
            })

    # Рекомендации по снижению эквалайзера перегруженных цехов
    for dept, info in grid_summary.items():
        if dept in seen_depts:
            continue
        dept_target = target_loads.get(dept, 7)
        dept_info = dept_summary.get(dept, {})
        dept_days = dept_info.get('days_needed', 0)

        # Если факт > цель × 3 и цех перегружен — можно снизить эквалайзер
        # чтобы штраф начинался раньше и заказы перетекали в другие цеха
        if dept_days > dept_target * 3 and dept_target > 2:
            suggested = max(2, round(dept_days / 3))
            if suggested < dept_target:
                seen_depts.add(dept)
                suggestions.append({
                    'dept': dept,
                    'current': dept_target,
                    'suggested': suggested,
                    'dependent_dept': None,
                    'gap_days': 0,
                    'pred_fact': round(dept_days, 1),
                    'reason': (
                        f'{dept} сильно перегружен: факт={round(dept_days, 1)} дн. при эквалайзере {dept_target} дн. '
                        f'Снизить эквалайзер до {suggested} дн. — штраф -20 начнётся при {suggested * 2} днях '
                        f'(сейчас при {dept_target * 2}), заказы сильнее перетекут в другие цеха.'
                    ),
                })

    # Сортируем по количеству дырок (самые критичные первые)
    suggestions.sort(key=lambda s: s['gap_days'], reverse=True)
    return suggestions[:5]


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
        # Формула: weight = (S_deadline×K1 + S_progress×K2 + S_dept_load×K3 + S_revenue×K5) / max → 0-1000
        # K1-K5 — из настроек приоритетов (слайдеры на фронте, бюджет 100)
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

        # Передаём настройки приоритетов, чтобы GPT писал комментарии
        # исходя из того что реально важно (а не всегда про просрочку)
        batch_payload = {
            'base_prompt': config.base_prompt,
            'orders': top_orders,
            'department_load': data['dept_summary'],
            'today': data['today'],
            'priorities': {
                'k_deadline': config.weight_k_deadline,
                'k_progress': 100 - config.weight_k_revenue,
                'k_dept_load': config.weight_k_dept_load,
                'k_feedback': config.weight_k_feedback,
                'k_revenue': config.weight_k_revenue,
            },
        }

        resp = _request_with_retry(N8N_BATCH_URL, batch_payload, timeout=180)
        resp.raise_for_status()
        # n8n может вернуть пустой ответ если workflow упал — обрабатываем gracefully
        try:
            gpt_entries = resp.json().get('entries', [])
        except Exception:
            logger.warning('n8n вернул пустой/некорректный ответ для batch, пропускаем AI комментарии')
            gpt_entries = []

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

        _update_config(task_phase='Подготовка данных для плана...')

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

        # ──── Аналитика настроек — для рекомендаций GPT по слайдерам ────
        # Считаем метрики, которые помогут GPT понять, какие настройки стоит изменить:
        # - сколько просроченных/почти готовых заказов
        # - какие цеха простаивают/перегружены
        # - как компоненты формулы влияют на топ-30
        # - целевая vs фактическая загрузка
        from plan.models import DepartmentWorkers

        near_complete = 0
        for o in orders:
            depts = o.get('departments', {})
            total = 0
            done = 0
            for d, s in depts.items():
                if s.get('all', 0) > 0:
                    total += 1
                    if s.get('ready', 0) >= s.get('all', 0):
                        done += 1
            if total > 0 and done / total >= 0.8 and done / total < 1.0:
                near_complete += 1

        idle_depts = []
        overloaded_depts = []
        target_vs_actual = {}
        target_loads_map = {dw.department: dw.target_load_days for dw in DepartmentWorkers.objects.all()}
        for dept, info in data['dept_summary'].items():
            days = info.get('days_needed', 0)
            target = target_loads_map.get(dept, 7)
            target_vs_actual[dept] = {'target': target, 'actual': round(days, 1)}
            if days < 1:
                idle_depts.append(dept)
            elif days > 10:
                overloaded_depts.append(dept)

        # Средний вклад компонентов формулы в топ-30 заказов
        avg_components = {'deadline': 0, 'progress': 0, 'dept_load': 0, 'revenue': 0}
        top_details_count = 0
        for entry in final_entries:
            detail = entry.weight_detail or {}
            if detail.get('deadline') is not None:
                avg_components['deadline'] += abs(detail.get('deadline', 0))
                avg_components['progress'] += abs(detail.get('progress', 0))
                avg_components['dept_load'] += abs(detail.get('dept_load', 0))
                avg_components['revenue'] += abs(detail.get('revenue', 0))
                top_details_count += 1
        if top_details_count > 0:
            total_avg = (
                avg_components['deadline'] + avg_components['progress'] +
                avg_components['dept_load'] + avg_components['revenue']
            ) or 1
            avg_components = {
                'deadline': round(avg_components['deadline'] / total_avg * 100),
                'progress': round(avg_components['progress'] / total_avg * 100),
                'dept_load': round(avg_components['dept_load'] / total_avg * 100),
                'revenue': round(avg_components['revenue'] / total_avg * 100),
            }

        feedbacks_count = AiPlanEntry.objects.exclude(feedback='').count()

        settings_analysis = {
            'overdue_count': data.get('overdue_count', 0),
            'near_complete_count': near_complete,
            'idle_depts': idle_depts,
            'overloaded_depts': overloaded_depts,
            'feedbacks_count': feedbacks_count,
            'avg_weight_components': avg_components if top_details_count > 0 else None,
            'target_vs_actual': target_vs_actual,
        }

        # ── Этап 5а: Рекомендации по настройкам (отдельный GPT вызов) ──
        # Специализированный промпт анализирует настройки слайдеров и эквалайзера,
        # понимает формулу расчёта и даёт конкретные рекомендации по значениям.
        # Результат подставляется в summary как готовый текст.
        _update_config(task_phase='Анализ настроек...')
        settings_recs = {'settings_recommendations': '', 'equalizer_recommendations': ''}
        try:
            # Добавляем weight_detail в top_orders для анализа влияния компонентов
            top_orders_with_detail = []
            for o in top_orders_list:
                o_copy = dict(o)
                sid = o.get('order', '')
                # Найти detail из entry
                for entry in final_entries:
                    if entry.order_product.series_id == o_copy.get('series_id', ''):
                        o_copy['weight_detail'] = entry.weight_detail or {}
                        break
                top_orders_with_detail.append(o_copy)

            # Собрать единый граф зависимостей из всех workflow
            # (объединение всех типов изделий — для GPT достаточно общей картины)
            dept_dependencies = {}  # {цех: [от кого зависит]}
            dept_feeds = {}  # {цех: [кому передаёт работу]}
            for wf in workflows.values():
                for src, targets in wf.items():
                    if src in ('Старт', 'Готово'):
                        continue
                    for tgt in targets:
                        if tgt in ('Старт', 'Готово'):
                            continue
                        if tgt not in dept_dependencies:
                            dept_dependencies[tgt] = set()
                        dept_dependencies[tgt].add(src)
                        if src not in dept_feeds:
                            dept_feeds[src] = set()
                        dept_feeds[src].add(tgt)
            # Конвертируем set → list для JSON-сериализации
            dept_dependencies = {k: sorted(v) for k, v in dept_dependencies.items()}
            dept_feeds = {k: sorted(v) for k, v in dept_feeds.items()}

            # Рассчитать рекомендации по эквалайзеру на основе дырок в графике
            # (Python считает конкретные числа — GPT только форматирует текст)
            equalizer_suggestions = _calc_equalizer_suggestions(
                grid_summary, dept_dependencies, target_loads_map, data['dept_summary']
            )

            settings_payload = {
                'priorities': {
                    'k_deadline': config.weight_k_deadline,
                    'k_progress': 100 - config.weight_k_revenue,
                    'k_dept_load': config.weight_k_dept_load,
                    'k_feedback': config.weight_k_feedback,
                    'k_revenue': config.weight_k_revenue,
                },
                'settings_analysis': settings_analysis,
                'department_load': data['dept_summary'],
                'grid_summary': grid_summary,
                'total_orders': data['total_orders'],
                'urgent_count': data['urgent_count'],
                'top_orders': top_orders_with_detail[:10],
                'dept_dependencies': dept_dependencies,
                'dept_feeds': dept_feeds,
                'equalizer_suggestions': equalizer_suggestions,
            }
            settings_resp = _request_with_retry(N8N_SETTINGS_URL, settings_payload, timeout=60)
            settings_resp.raise_for_status()
            settings_recs = settings_resp.json()
            logger.info(f'Рекомендации по настройкам получены: {len(settings_recs.get("settings_recommendations", ""))} символов')
        except Exception as e:
            logger.warning(f'Не удалось получить рекомендации по настройкам: {e}')

        # ── Этап 5б: Summary — план на день (использует готовые рекомендации) ──
        _update_config(task_phase='Генерация плана на день...')
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
                'k_progress': 100 - config.weight_k_revenue,
                'k_dept_load': config.weight_k_dept_load,
                'k_feedback': config.weight_k_feedback,
                'k_revenue': config.weight_k_revenue,
            },
            'settings_recommendations': settings_recs.get('settings_recommendations', ''),
            'equalizer_recommendations': settings_recs.get('equalizer_recommendations', ''),
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
