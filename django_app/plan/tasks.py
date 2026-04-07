import logging
import time
import requests
from celery import shared_task

logger = logging.getLogger(__name__)

N8N_SUMMARY_URL = 'http://n8n:5678/webhook/ai-plan-summary'
N8N_BATCH_URL = 'http://n8n:5678/webhook/ai-plan-batch'
BATCH_SIZE = 50
MAX_RETRIES = 3
RETRY_DELAY = 10  # секунд


def _request_with_retry(url, payload, timeout=180):
    """POST запрос с retry при сетевых ошибках."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            resp.raise_for_status()
            return resp
        except (requests.ConnectionError, requests.Timeout) as e:
            if attempt == MAX_RETRIES:
                raise
            logger.warning(f'Request to {url} failed (attempt {attempt}/{MAX_RETRIES}): {e}. Retrying in {RETRY_DELAY}s...')
            time.sleep(RETRY_DELAY)


def _update_config(**fields):
    from plan.models import AiPlanConfig
    config, _ = AiPlanConfig.objects.get_or_create(pk=1)
    for k, v in fields.items():
        setattr(config, k, v)
    config.save(update_fields=list(fields.keys()) + ['updated_at'])
    return config


def _is_cancelled():
    from plan.models import AiPlanConfig
    try:
        config = AiPlanConfig.objects.get(pk=1)
        return config.task_status == 'cancelled'
    except AiPlanConfig.DoesNotExist:
        return False


def _score_deadline(days_left):
    """Сроки: 0-100. Чем больше просрочка — тем выше."""
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
    """Прогресс: 0-100. Почти готовые заказы — выше (дожать).
    departments: dict {dept: {ready, all}}
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
        return -50  # всё готово — нечего делать, опускаем
    if pct >= 80:
        return 100  # почти готов — дожать!
    if pct >= 60:
        return 65
    if pct >= 40:
        return 35
    if pct >= 20:
        return 15
    return 0


def _score_dept_load(departments, dept_load_days):
    """Загрузка цехов: 0-100. Заказы для голодающих цехов — выше.
    departments: dict {dept: {ready, all}} — что нужно этому заказу
    dept_load_days: dict {dept: float} — сколько дней работы у цеха
    """
    score = 0
    for dept, status in departments.items():
        all_count = status.get('all', 0)
        ready_count = status.get('ready', 0)
        remaining = all_count - ready_count
        if remaining <= 0:
            continue  # этот цех для заказа уже сделан

        load_days = dept_load_days.get(dept, 999)

        if load_days < 1:
            score += 50  # цех простаивает!
        elif load_days < 3:
            score += 25  # скоро будет голодать

        # Бонус за "дожать в перегруженном цеху"
        if load_days > 10 and all_count > 0:
            done_pct = ready_count / all_count
            if done_pct >= 0.7:
                score += 30  # >70% сделано в перегруженном — дожать

    return min(score, 100)


def _calculate_all_weights(orders, dept_summary, config):
    """Рассчитать веса всех заказов на основе формулы и коэффициентов.
    Returns: list of {series_id, weight, detail: {deadline, progress, dept_load}}
    """
    k1 = config.weight_k_deadline
    k2 = config.weight_k_progress
    k3 = config.weight_k_dept_load

    # Загруженность цехов в днях
    dept_load_days = {}
    for dept, info in dept_summary.items():
        dept_load_days[dept] = info.get('days_needed', 999)

    results = []
    for order in orders:
        s_deadline = _score_deadline(order.get('days_left'))
        s_progress = _score_progress(order.get('departments', {}))
        s_dept_load = _score_dept_load(order.get('departments', {}), dept_load_days)

        raw_weight = (s_deadline * k1 + s_progress * k2 + s_dept_load * k3)
        # Нормализуем к 0-1000
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

    # Убрать дубли — каждый вес уникальный
    results.sort(key=lambda x: x['weight'], reverse=True)
    seen = set()
    for r in results:
        while r['weight'] in seen:
            r['weight'] -= 1
        seen.add(r['weight'])

    return results


def _save_weights_to_db(weight_results):
    """Сохранить рассчитанные веса в БД."""
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
            logger.warning(f'Failed to save weight for {sid}: {e}')


@shared_task(name="generate_ai_plan_full", bind=True, max_retries=0, time_limit=3600, soft_time_limit=3500)
def generate_ai_plan_full(self):
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
        # --- Этап 1: Сбор данных ---
        data = _collect_orders_data()
        config = _get_ai_config()
        orders = data['orders']
        total = len(orders)

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # --- Этап 2: Python считает веса всем заказам ---
        _update_config(task_phase='Расчёт весов...', task_total=total)

        weight_results = _calculate_all_weights(orders, data['dept_summary'], config)
        weight_map = {r['series_id']: r for r in weight_results}

        # Сохранить веса в БД
        _save_weights_to_db(weight_results)

        _update_config(task_phase='Комментарии AI...', task_progress=0)

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # --- Этап 3: Batch GPT — комментарии + adjustment (только топ-50) ---
        # Сортируем по весу, берём топ для GPT
        sorted_by_weight = sorted(weight_results, key=lambda x: x['weight'], reverse=True)
        top_series_ids = {r['series_id'] for r in sorted_by_weight[:BATCH_SIZE]}

        # Обогащаем заказы рассчитанным весом
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

        # Применить adjustment и сохранить комментарии
        from plan.models import AiPlanEntry
        from core.models import OrderProduct

        k4 = config.weight_k_feedback
        adjustment_map = {}
        for entry in gpt_entries:
            sid = entry.get('series_id', '')
            adj = entry.get('weight_adjustment', 0)
            comment = entry.get('ai_comment', '')
            adjustment_map[sid] = {'adjustment': adj, 'comment': comment}

            # Сохранить комментарий и применить adjustment
            try:
                op = OrderProduct.objects.filter(series_id=sid).first()
                if not op:
                    continue
                ai_entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
                ai_entry.ai_comment = comment

                # Применить adjustment с коэффициентом K4
                base_weight = weight_map.get(sid, {}).get('weight', 500)
                adj_value = int(adj * k4 / 50)  # нормализуем adjustment по K4
                final_weight = max(0, min(1000, base_weight + adj_value))
                ai_entry.sort_weight = final_weight

                detail = weight_map.get(sid, {}).get('detail', {})
                detail['adjustment'] = adj
                detail['adj_reason'] = comment
                ai_entry.weight_detail = detail

                ai_entry.save(update_fields=['ai_comment', 'sort_weight', 'weight_detail', 'updated_at'])
            except Exception as e:
                logger.warning(f'Failed to save GPT entry for {sid}: {e}')

        _update_config(task_progress=total)

        # Убрать дубли финальных весов
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

        # --- Этап 4: Summary (план на день с разбивкой по цехам) ---
        _update_config(task_phase='Генерация плана на день...')

        # Загрузить финальные данные из БД
        order_by_series = {o['series_id']: o for o in orders}
        final_entries = AiPlanEntry.objects.order_by('-sort_weight')[:30]

        # Загрузить feedback
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

        # Группировка заказов по цехам для summary
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
        }

        resp = _request_with_retry(N8N_SUMMARY_URL, summary_payload, timeout=120)
        resp.raise_for_status()
        summary = resp.json().get('summary', '')

        from plan.models import AiPlanConfig as ConfigModel
        cfg = ConfigModel.objects.get(pk=1)
        cfg.ai_summary = summary
        cfg.save(update_fields=['ai_summary', 'updated_at'])

        _update_config(task_status='completed', task_phase='', task_progress=total)

    except Exception as e:
        logger.error(f'AI plan generation failed: {e}', exc_info=True)
        _update_config(task_status='failed', task_phase='', task_error=str(e))
