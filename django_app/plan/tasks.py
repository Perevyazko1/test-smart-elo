import logging
import requests
from celery import shared_task

logger = logging.getLogger(__name__)

N8N_SUMMARY_URL = 'http://n8n:5678/webhook/ai-plan-summary'
N8N_BATCH_URL = 'http://n8n:5678/webhook/ai-plan-batch'
BATCH_SIZE = 50


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


@shared_task(name="generate_ai_plan_full", bind=True, max_retries=0, time_limit=3600, soft_time_limit=3500)
def generate_ai_plan_full(self):
    from plan.views import _collect_orders_data, _save_ai_entries, _get_ai_config

    _update_config(
        task_id=self.request.id or '',
        task_status='running',
        task_phase='Сбор данных...',
        task_progress=0,
        task_total=0,
        task_error='',
    )

    try:
        # Собрать данные один раз
        data = _collect_orders_data()
        config = _get_ai_config()
        total = len(data['orders'])

        _update_config(task_phase='Комментарии к заказам...', task_total=total)

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # --- Этап 1: Батчи (расставляем веса и комментарии) ---
        orders = data['orders']
        all_entries = []
        offset = 0
        while offset < total:
            if _is_cancelled():
                _update_config(task_status='cancelled', task_phase='')
                return

            batch = orders[offset:offset + BATCH_SIZE]
            batch_number = offset // BATCH_SIZE + 1
            total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

            batch_payload = {
                'base_prompt': config.base_prompt,
                'orders': batch,
                'department_load': data['dept_summary'],
                'today': data['today'],
                'batch_number': batch_number,
                'total_batches': total_batches,
                'position_offset': offset,
            }

            resp = requests.post(N8N_BATCH_URL, json=batch_payload, timeout=180)
            resp.raise_for_status()
            entries = resp.json().get('entries', [])
            _save_ai_entries(entries)
            all_entries.extend(entries)

            processed = min(offset + BATCH_SIZE, total)
            _update_config(task_progress=processed)

            offset += BATCH_SIZE

        if _is_cancelled():
            _update_config(task_status='cancelled', task_phase='')
            return

        # --- Этап 2: Summary (общий план на основе результатов batch) ---
        _update_config(task_phase='Генерация плана на день...')

        # Топ заказы по весу из batch результатов
        sorted_entries = sorted(all_entries, key=lambda e: e.get('sort_weight', 0), reverse=True)
        top_by_weight = sorted_entries[:30]

        # Маппинг series_id → order data для обогащения
        order_by_series = {o['series_id']: o for o in orders}
        top_orders_list = []
        for entry in top_by_weight:
            sid = entry.get('series_id', '')
            o = order_by_series.get(sid, {})
            top_orders_list.append({
                'order': o.get('order', ''),
                'product': o.get('product', ''),
                'product_type': o.get('product_type', ''),
                'quantity': o.get('quantity', 0),
                'urgency': o.get('urgency', 3),
                'deadline': o.get('deadline', ''),
                'days_left': o.get('days_left'),
                'project': o.get('project', ''),
                'sort_weight': entry.get('sort_weight', 0),
                'ai_comment': entry.get('ai_comment', ''),
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
        }

        resp = requests.post(N8N_SUMMARY_URL, json=summary_payload, timeout=120)
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
