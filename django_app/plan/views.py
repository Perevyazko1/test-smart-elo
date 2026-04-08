import json
import logging
import re
import requests

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from core.models import Assignment, OrderProduct, Order, AgentTag, ProductionStep, OrderProductComment, Product
from core.pages.orders_page.serializers import OrderProductCommentSerializer
from core.serializers import AgentTagSerializer
from plan.models import AiPlanEntry, AiPlanConfig, ProductType, ProductionNorm, ProductNormOverride, DepartmentWorkers
from staff.models import Employee, Department
from staff.serializers import EmployeeSerializer

logger = logging.getLogger(__name__)

OLLAMA_URL = 'http://ollama:11434/api/chat'


@api_view(['GET'])
def get_plan_table(request):
    project = request.query_params.get('project')
    manager_id = request.query_params.get('manager_id')
    agent_id = request.query_params.get('agent_id')

    query_filter = {
        "order_product__status": "0",
    }

    if project:
        if project == "Без проекта":
            project = ""
        query_filter["order_product__order__project"] = project

    if manager_id:
        query_filter["order_product__order__owner_id"] = manager_id

    if agent_id:
        query_filter["order_product__order__agent__tags__id"] = agent_id

    assignments_query = Assignment.objects.filter(**query_filter)

    dept_map = {
        "Конструктора": "konstruktora",
        "Обивка": "obivka",
        "Пошив": "poshiv",
        "Малярка": "malyarka",
        "Сборка": "sborka",
        "Упаковка": "upakovka",
    }
    department_aggregates = {}
    for dept_name, dept_key in dept_map.items():
        department_aggregates[f'{dept_key}_all'] = Count('id', filter=Q(department__name=dept_name))
        department_aggregates[f'{dept_key}_ready'] = Count(
            'id', filter=Q(department__name=dept_name, status="ready", inspector__isnull=False)
        )
        department_aggregates[f'{dept_key}_await'] = Count(
            'id', filter=Q(department__name=dept_name, status="ready", inspector__isnull=True)
        )
    assignment_groups = assignments_query.values(
        'order_product_id',
        'order_product__series_id',
        'urgency',
        sort_date_trunc=TruncDate('sort_date')
    ).annotate(**department_aggregates).order_by('order_product__series_id', 'urgency', 'sort_date_trunc')

    order_product_ids = assignments_query.values_list('order_product_id', flat=True).distinct()

    comments_queryset = OrderProductComment.objects.filter(
        order_product_id__in=order_product_ids,
        deleted=False
    )
    comments_data = OrderProductCommentSerializer(comments_queryset, many=True).data
    comments_map = {}
    for comment in comments_data:
        op_id = comment['order_product']
        if op_id not in comments_map:
            comments_map[op_id] = []
        comments_map[op_id].append(comment)

    order_products = OrderProduct.objects.filter(
        id__in=order_product_ids
    ).select_related(
        'product', 'order', 'main_fabric', 'order__owner'
    ).prefetch_related(
        'product__product_pictures', 'main_fabric__fabric_pictures'
    )

    order_products_map = {op.id: op for op in order_products}

    result = {}
    for group in assignment_groups:
        order_product = order_products_map.get(group['order_product_id'])
        if not order_product:
            continue

        sort_date_val = group['sort_date_trunc']
        plane_date_key = sort_date_val if sort_date_val else 'nodate'
        urgency_val = group.get('urgency') if 'urgency' in group else None
        urgency_key = urgency_val if urgency_val else 'no_urgency'
        key = f"{group['order_product__series_id']}-{plane_date_key}-{urgency_key}"

        assignments_data = {}
        for dept_name, dept_key in dept_map.items():
            all_count = group[f'{dept_key}_all']
            if all_count > 0:
                assignments_data[dept_name] = {
                    "all": all_count,
                    "ready": group[f'{dept_key}_ready'],
                    "await": group[f'{dept_key}_await'],
                }

        if not assignments_data:
            continue

        product_image = order_product.product.product_pictures.first()
        picture_url = product_image.thumbnail.url if product_image else None

        fabric_image = order_product.main_fabric.fabric_pictures.first() if order_product.main_fabric else None
        fabric_url = fabric_image.thumbnail.url if fabric_image else None

        final_department = order_product.product.technological_process.final_department if order_product.product.technological_process else None

        if final_department:
            final_waiting_qs = Assignment.objects.filter(
                department=final_department,
                order_product=order_product,
                inspector__isnull=True,
            )

            if urgency_val is not None:
                final_waiting_qs = final_waiting_qs.filter(urgency=urgency_val)
            else:
                final_waiting_qs = final_waiting_qs.filter(urgency__isnull=True)

            if sort_date_val:
                final_waiting_qs = final_waiting_qs.filter(sort_date__date=sort_date_val)
            else:
                final_waiting_qs = final_waiting_qs.filter(sort_date__isnull=True)

            final_waiting = final_waiting_qs.count()
        else:
            final_waiting = order_product.quantity

        result[key] = {
            "date": sort_date_val,
            "urgency": urgency_val,
            "product_id": order_product.product_id,
            "product_name": order_product.product.name,
            "product_picture": picture_url,
            "order": order_product.order.inner_number,
            "series_id": order_product.series_id,
            "price": order_product.price,
            "fabric_name": order_product.main_fabric.name if order_product.main_fabric else "-",
            "fabric_picture": fabric_url,
            "fabric_stock": order_product.main_fabric.quantity if order_product.main_fabric and order_product.main_fabric.is_actual else None,
            "project": order_product.order.project,
            "quantity": max((data["all"] for data in assignments_data.values()), default=0),
            "all_quantity": order_product.quantity,
            "shipped": order_product.shipped,
            "final_waiting": final_waiting,
            "comments": comments_map.get(order_product.id, []),
            "assignments": assignments_data
        }

    return JsonResponse(result)


@api_view(['POST'])
def set_target_date(request):
    target_date = request.data.get('target_date')
    series_id = request.data.get('series_id')
    date_from = request.data.get('date_from')
    quantity = request.data.get('quantity')
    urgency = request.data.get('urgency')
    old_urgency = request.data.get('old_urgency')

    if target_date:
        # Normalize target_date to YYYY-MM-DD format
        target_datetime = parse_datetime(target_date).date()
    else:
        target_datetime = None

    if date_from:
        # Normalize date_from to YYYY-MM-DD format
        target_date_from = parse_datetime(date_from).date()
    else:
        target_date_from = None

    target_order_product = OrderProduct.objects.get(series_id=series_id)

    base_department = ProductionStep.objects.filter(
        product=target_order_product.product,
        department__single=False,
        is_active=True,
    ).first()

    if not base_department:
        base_department = Department.objects.get(name="Конструктора")
    else:
        base_department = base_department.department

    assignments = Assignment.objects.filter(
        order_product=target_order_product,
        department=base_department,
    )

    old_map = {}

    for assignment in assignments:
        s_date = assignment.sort_date.date() if assignment.sort_date else None
        key = f'{s_date}|{assignment.urgency}'
        if key not in old_map:
            old_map[key] = 1
        else:
            old_map[key] += 1

    # Логика создания новой карты
    new_map = old_map.copy()
    qty_to_move = int(quantity)

    source_urgency = old_urgency if old_urgency is not None else urgency
    source_key = f'{target_date_from}|{source_urgency}'
    dest_key = f'{target_datetime}|{urgency}'

    if source_key in new_map:
        new_map[source_key] -= qty_to_move
        if new_map[source_key] <= 0:
            del new_map[source_key]

    if dest_key not in new_map:
        new_map[dest_key] = 0
    new_map[dest_key] += qty_to_move

    # Sort new_map by date and urgency
    sorted_items = sorted(new_map.items(), key=lambda x: (
        (True, x[0].split('|')[0]) if x[0].split('|')[0] == 'None' else (False, x[0].split('|')[0]),
        x[0].split('|')[1]
    ), reverse=True)
    new_map = dict(sorted_items)

    all_quantity = target_order_product.quantity
    numbers = [i for i in range(1, all_quantity + 1)]

    while numbers:
        if not new_map:
            urgency = 3
            date = None
            nums = numbers
            numbers = []
        else:
            first_item = new_map.popitem()
            nums = numbers[:first_item[1]]
            numbers = numbers[first_item[1]:]
            urgency = first_item[0].split('|')[1]
            date_str = first_item[0].split('|')[0]
            date = None if date_str == 'None' else parse_datetime(date_str).date()

        Assignment.objects.filter(
            order_product=target_order_product,
            number__in=nums,
        ).update(
            sort_date=date,
            urgency=urgency
        )

    return JsonResponse({"success": True})


@api_view(['GET'])
def get_projects(request):
    projects = list(
        Order.objects
        .filter(order_products__status=0)
        .distinct('project')
        .values_list('project', flat=True)
    )

    result = ['Все проекты']

    result += projects

    return JsonResponse({"result": result}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_managers(request):
    users = Employee.objects.filter(
        api_id__isnull=False
    )
    return JsonResponse({"result": EmployeeSerializer(users, many=True).data})


@api_view(['GET'])
def get_agents(request):
    agents = AgentTag.objects.all()
    return JsonResponse(
        {
            "result": AgentTagSerializer(agents, many=True).data
        },
        json_dumps_params={
            "ensure_ascii": False
        }
    )


def _get_ai_config():
    config, _ = AiPlanConfig.objects.get_or_create(pk=1)
    return config


@api_view(['GET'])
def get_ai_plan(request):
    """Получить AI-данные для всех активных позиций заказов"""
    entries = AiPlanEntry.objects.filter(
        order_product__status='0'
    ).select_related('order_product')

    entries_data = {}
    for entry in entries:
        entries_data[entry.order_product.series_id] = {
            'sort_weight': entry.sort_weight,
            'sort_position': entry.sort_position,
            'ai_comment': entry.ai_comment,
            'feedback': entry.feedback,
            'weight_detail': entry.weight_detail or {},
        }

    config = _get_ai_config()

    return JsonResponse({
        'entries': entries_data,
        'config': {
            'base_prompt': config.base_prompt,
            'ai_summary': config.ai_summary,
        }
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_ai_feedback(request):
    """Сохранить ручной фидбэк по позиции заказа"""
    series_id = request.data.get('series_id')
    feedback = request.data.get('feedback', '')

    order_product = OrderProduct.objects.get(series_id=series_id)
    entry, _ = AiPlanEntry.objects.get_or_create(order_product=order_product)
    entry.feedback = feedback
    entry.save(update_fields=['feedback', 'updated_at'])

    return JsonResponse({'success': True})


@api_view(['POST'])
def update_ai_config(request):
    """Сохранить базовый промпт"""
    base_prompt = request.data.get('base_prompt', '')

    config = _get_ai_config()
    config.base_prompt = base_prompt
    config.save(update_fields=['base_prompt', 'updated_at'])

    return JsonResponse({'success': True})


N8N_SUMMARY_URL = 'http://n8n:5678/webhook/ai-plan-summary'
N8N_BATCH_URL = 'http://n8n:5678/webhook/ai-plan-batch'


def _collect_orders_data():
    """Собрать все данные о заказах, нормативах, загрузке цехов"""
    from datetime import date

    norms = {}
    for n in ProductionNorm.objects.select_related('product_type').all():
        if n.product_type.name not in norms:
            norms[n.product_type.name] = {}
        norms[n.product_type.name][n.department] = n.hours_per_unit

    # Переопределения на уровне конкретного Product
    overrides = {}
    for o in ProductNormOverride.objects.all():
        overrides[(o.product_id, o.department)] = o.hours_per_unit

    workers = {dw.department: dw.workers_count for dw in DepartmentWorkers.objects.all()}

    WORK_HOURS_PER_DAY = 8
    capacity = {dept: count * WORK_HOURS_PER_DAY for dept, count in workers.items()}

    order_products = OrderProduct.objects.filter(
        status='0'
    ).select_related('product', 'product__production_type', 'order', 'main_fabric')

    orders_info = []
    dept_load = {}

    for op in order_products:
        assignments = Assignment.objects.filter(order_product=op)
        dept_status = {}
        for a in assignments:
            dept_name = a.department.name if a.department else 'Без отдела'
            if dept_name not in dept_status:
                dept_status[dept_name] = {'all': 0, 'ready': 0}
            dept_status[dept_name]['all'] += 1
            if a.status == 'ready' and a.inspector is not None:
                dept_status[dept_name]['ready'] += 1

        product_type_name = op.product.production_type.name if op.product.production_type else None
        remaining_work = {}
        for dept_name, status in dept_status.items():
            remaining = status['all'] - status['ready']
            if remaining <= 0:
                continue
            # Приоритет: override для Product > дефолт из ProductType
            override_key = (op.product_id, dept_name)
            if override_key in overrides:
                hours_per = overrides[override_key]
            elif product_type_name and dept_name in norms.get(product_type_name, {}):
                hours_per = norms[product_type_name][dept_name]
            else:
                continue
            hours = remaining * hours_per
            remaining_work[dept_name] = round(hours, 1)
            dept_load[dept_name] = dept_load.get(dept_name, 0) + hours

        sort_dates = assignments.filter(sort_date__isnull=False).values_list('sort_date', flat=True)
        deadline = min(sort_dates).date() if sort_dates else None
        days_left = (deadline - date.today()).days if deadline else None

        try:
            feedback = op.ai_plan_entry.feedback
        except AiPlanEntry.DoesNotExist:
            feedback = ''

        orders_info.append({
            'series_id': op.series_id,
            'product': op.product.name,
            'product_type': product_type_name,
            'order': op.order.inner_number if op.order else '',
            'project': op.order.project if op.order else '',
            'quantity': op.quantity,
            'urgency': op.urgency,
            'deadline': str(deadline) if deadline else None,
            'days_left': days_left,
            'departments': dept_status,
            'remaining_hours': remaining_work,
            'feedback': feedback,
        })

    dept_summary = {}
    for dept, total_hours in dept_load.items():
        cap = capacity.get(dept, WORK_HOURS_PER_DAY)
        dept_summary[dept] = {
            'total_hours': round(total_hours, 1),
            'workers': workers.get(dept, 1),
            'hours_per_day': cap,
            'days_needed': round(total_hours / cap, 1) if cap > 0 else 999,
        }

    # Сводка по типам
    type_counts = {}
    for o in orders_info:
        t = o['product_type'] or 'Без типа'
        type_counts[t] = type_counts.get(t, 0) + o['quantity']

    # Сводка по срокам
    overdue = [o for o in orders_info if o['days_left'] is not None and o['days_left'] < 0]
    urgent = [o for o in orders_info if o['urgency'] == 1]

    # Дневная мощность — сколько изделий можно сделать за день в каждом цеху
    daily_capacity = {}
    for dept, cap in capacity.items():
        # Средние часы на изделие в этом цеху
        dept_norms = [n.hours_per_unit for n in ProductionNorm.objects.filter(department=dept) if n.hours_per_unit > 0]
        avg_hours = sum(dept_norms) / len(dept_norms) if dept_norms else 1
        daily_capacity[dept] = {
            'items_per_day': round(cap / avg_hours) if avg_hours > 0 else 0,
            'hours_per_day': cap,
        }

    # Общая дневная мощность — ограничена узким местом
    bottleneck_items = min((v['items_per_day'] for v in daily_capacity.values()), default=0) if daily_capacity else 0

    # Графы цехов по типам изделий
    workflows = {}
    for pt in ProductType.objects.all():
        if pt.workflow_graph:
            workflows[pt.name] = pt.workflow_graph

    return {
        'orders': orders_info,
        'dept_summary': dept_summary,
        'type_counts': type_counts,
        'total_orders': len(orders_info),
        'overdue_count': len(overdue),
        'urgent_count': len(urgent),
        'daily_capacity': daily_capacity,
        'bottleneck_items_per_day': bottleneck_items,
        'today': str(date.today()),
        'workflows': workflows,
    }


@api_view(['POST'])
def reset_ai_plan(request):
    """Сброс всех AI-данных: комментарии, веса, summary"""
    AiPlanEntry.objects.all().update(sort_weight=50, sort_position=0, ai_comment='')
    config = _get_ai_config()
    config.ai_summary = ''
    config.save(update_fields=['ai_summary', 'updated_at'])
    count = AiPlanEntry.objects.count()
    return JsonResponse({'success': True, 'reset': count})


def _save_ai_entries(entries_data):
    """Сохранить AI-записи в БД"""
    count = 0
    for entry_data in entries_data:
        sid = entry_data.get('series_id')
        if not sid:
            continue
        try:
            op = OrderProduct.objects.get(series_id=sid)
            entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
            entry.sort_weight = entry_data.get('sort_weight', 50)
            entry.sort_position = entry_data.get('sort_position', 0)
            entry.ai_comment = entry_data.get('ai_comment', '')
            entry.save(update_fields=['sort_weight', 'sort_position', 'ai_comment', 'updated_at'])
            count += 1
        except OrderProduct.DoesNotExist:
            pass
    return count


@api_view(['POST'])
def generate_ai_plan(request):
    """Запуск полной генерации AI плана через Celery."""
    from django.utils import timezone
    from plan.tasks import generate_ai_plan_full

    config = _get_ai_config()

    # Если задача уже выполняется — не запускать повторно
    if config.task_status == 'running' and config.task_id:
        # Защита от зависших задач (>10 минут без обновления)
        if (timezone.now() - config.updated_at).total_seconds() > 600:
            config.task_status = 'idle'
            config.save(update_fields=['task_status', 'updated_at'])
        else:
            return JsonResponse({'status': 'already_running', 'task_id': config.task_id})

    result = generate_ai_plan_full.delay()

    return JsonResponse({'status': 'started', 'task_id': result.id})


@api_view(['GET'])
def ai_plan_progress(request):
    """Прогресс выполнения AI задачи."""
    config = _get_ai_config()
    return JsonResponse({
        'status': config.task_status,
        'phase': config.task_phase,
        'current': config.task_progress,
        'total': config.task_total,
        'error': config.task_error,
    })


@api_view(['POST'])
def ai_plan_cancel(request):
    """Отмена текущей AI задачи."""
    config = _get_ai_config()
    if config.task_status == 'running':
        config.task_status = 'cancelled'
        config.save(update_fields=['task_status', 'updated_at'])
        return JsonResponse({'status': 'cancelled'})
    return JsonResponse({'status': config.task_status})


@api_view(['GET'])
def get_weight_coefficients(request):
    """Получить коэффициенты слайдеров."""
    config = _get_ai_config()
    return JsonResponse({
        'k_deadline': config.weight_k_deadline,
        'k_progress': config.weight_k_progress,
        'k_dept_load': config.weight_k_dept_load,
        'k_feedback': config.weight_k_feedback,
    })


@api_view(['POST'])
def save_weight_coefficients(request):
    """Сохранить коэффициенты слайдеров."""
    config = _get_ai_config()
    fields = []
    for key in ('k_deadline', 'k_progress', 'k_dept_load', 'k_feedback'):
        val = request.data.get(key)
        if val is not None:
            setattr(config, f'weight_{key}', max(0, min(50, int(val))))
            fields.append(f'weight_{key}')
    if fields:
        config.save(update_fields=fields + ['updated_at'])
    return JsonResponse({'status': 'ok'})


N8N_WEBHOOK_URL = 'http://n8n:5678/webhook/ai-plan-prompt'
N8N_CLASSIFY_URL = 'http://n8n:5678/webhook/classify-products'


@api_view(['POST'])
def process_ai_prompt(request):
    """Прокидывает промпт в n8n. n8n сам: Ollama парсит → поиск → обновление."""
    user_prompt = request.data.get('prompt', '').strip()
    if not user_prompt:
        return JsonResponse({'success': False, 'error': 'Пустой запрос'}, status=400)

    config = _get_ai_config()

    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json={
                'user_prompt': user_prompt,
                'base_prompt': config.base_prompt,
            },
            timeout=300,
        )
        response.raise_for_status()
        ai_data = response.json()

        # Сохраняем сводку если есть
        summary = ai_data.get('summary', '')
        if summary:
            config.ai_summary = summary
            config.save(update_fields=['ai_summary', 'updated_at'])

        return JsonResponse({
            'success': True,
            'updated': ai_data.get('updated', 0),
            'ai_response': ai_data.get('response', ''),
        }, json_dumps_params={"ensure_ascii": False})

    except requests.exceptions.Timeout:
        return JsonResponse({'success': False, 'error': 'n8n не ответил вовремя'}, status=504)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'n8n вернул некорректный ответ'}, status=500)
    except requests.exceptions.ConnectionError:
        return JsonResponse({'success': False, 'error': 'Не удалось подключиться к n8n'}, status=503)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def search_orders(request):
    """Поиск заказов по строке (для n8n)"""
    query = request.query_params.get('q', '').strip()
    if not query:
        return JsonResponse({'results': []})

    words = [w for w in query.split() if len(w) >= 2]
    if not words:
        return JsonResponse({'results': []})

    def make_word_filter(word):
        return (
            Q(product__name__icontains=word) |
            Q(order__inner_number__icontains=word) |
            Q(order__project__icontains=word) |
            Q(series_id__icontains=word) |
            Q(main_fabric__name__icontains=word)
        )

    base = Q(status='0')
    results = None

    # Постепенно убираем слова пока не найдём результат
    for n in range(len(words), 0, -1):
        from itertools import combinations
        for combo in combinations(words, n):
            q = base
            for w in combo:
                q &= make_word_filter(w)
            qs = OrderProduct.objects.filter(q).select_related('product', 'order', 'main_fabric').distinct()[:10]
            if qs.exists():
                results = qs
                break
        if results is not None:
            break

    if results is None:
        results = OrderProduct.objects.none()

    data = []
    for op in results:
        try:
            ai_entry = op.ai_plan_entry
        except AiPlanEntry.DoesNotExist:
            ai_entry = None

        data.append({
            'series_id': op.series_id,
            'product': op.product.name,
            'order': op.order.inner_number if op.order else '',
            'project': op.order.project if op.order else '',
            'fabric': op.main_fabric.name if op.main_fabric else '',
            'quantity': op.quantity,
            'urgency': op.urgency,
            'current_weight': ai_entry.sort_weight if ai_entry else 50,
        })

    return JsonResponse({'results': data}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_ai_entries(request):
    """Массовое обновление AI-записей (для n8n)"""
    entries = request.data.get('entries', [])
    updated = 0

    for entry_data in entries:
        sid = entry_data.get('series_id')
        if not sid:
            continue
        try:
            op = OrderProduct.objects.get(series_id=sid)
            entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
            if 'sort_weight' in entry_data:
                entry.sort_weight = entry_data['sort_weight']
            if 'sort_position' in entry_data:
                entry.sort_position = entry_data['sort_position']
            if 'ai_comment' in entry_data:
                entry.ai_comment = entry_data['ai_comment']
            entry.save(update_fields=['sort_weight', 'sort_position', 'ai_comment', 'updated_at'])
            updated += 1
        except OrderProduct.DoesNotExist:
            pass

    return JsonResponse({'success': True, 'updated': updated})


@api_view(['POST'])
def classify_products(request):
    """Запуск классификации продуктов через n8n"""
    offset = request.data.get('offset', 0)
    try:
        response = requests.post(
            N8N_CLASSIFY_URL,
            json={'offset': offset},
            timeout=300,
        )
        response.raise_for_status()
        if not response.text.strip():
            return JsonResponse({'error': 'n8n вернул пустой ответ. Проверьте что воркфлоу classify-products импортирован и активирован.'}, status=502)
        return JsonResponse(response.json(), json_dumps_params={"ensure_ascii": False})
    except Exception as e:
        logger.error(f'Classify products error: {e}')
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
def get_production_norms(request):
    """Таблица нормативов: типы изделий × цеха → часы"""
    product_types = ProductType.objects.prefetch_related('norms').all()
    departments = list(Department.objects.filter(has_norms=True).order_by('ordering', 'name').values_list('name', flat=True))

    data = []
    for pt in product_types:
        norms_map = {n.department: n.hours_per_unit for n in pt.norms.all()}
        row = {'id': pt.id, 'name': pt.name}
        for dept in departments:
            row[dept] = norms_map.get(dept, 0)
        data.append(row)

    return JsonResponse({
        'departments': departments,
        'rows': data,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_production_norms(request):
    """Обновить нормативы. Принимает {rows: [{id?, name, Обивка: 1, Крой: 0.5, ...}]}"""
    rows = request.data.get('rows', [])
    departments = list(Department.objects.filter(has_norms=True).order_by('ordering', 'name').values_list('name', flat=True))

    for row in rows:
        name = row.get('name', '').strip()
        if not name:
            continue

        pt_id = row.get('id')
        if pt_id:
            try:
                pt = ProductType.objects.get(pk=pt_id)
                if pt.name != name:
                    pt.name = name
                    pt.save(update_fields=['name'])
            except ProductType.DoesNotExist:
                pt = ProductType.objects.create(name=name)
        else:
            pt, _ = ProductType.objects.get_or_create(name=name)

        for dept in departments:
            if dept in row:
                val = float(row[dept] or 0)
                ProductionNorm.objects.update_or_create(
                    product_type=pt, department=dept,
                    defaults={'hours_per_unit': val},
                )

    return JsonResponse({'success': True})


@api_view(['POST'])
def add_product_type(request):
    """Добавить новый тип изделия"""
    name = request.data.get('name', '').strip()
    if not name:
        return JsonResponse({'error': 'Пустое название'}, status=400)
    pt, created = ProductType.objects.get_or_create(name=name)
    if not created:
        return JsonResponse({'error': 'Тип уже существует'}, status=400)

    departments = list(Department.objects.filter(has_norms=True).order_by('ordering', 'name').values_list('name', flat=True))
    for dept in departments:
        ProductionNorm.objects.create(product_type=pt, department=dept, hours_per_unit=0)

    return JsonResponse({'id': pt.id, 'name': pt.name})


@api_view(['POST'])
def delete_product_type(request):
    """Удалить тип изделия"""
    pt_id = request.data.get('id')
    try:
        pt = ProductType.objects.get(pk=pt_id)
        pt.delete()
        return JsonResponse({'success': True})
    except ProductType.DoesNotExist:
        return JsonResponse({'error': 'Не найден'}, status=404)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_untyped_products(request):
    """Продукты без типа изделия (для n8n классификации). Батч по offset/limit."""
    offset = int(request.query_params.get('offset', 0))
    limit = int(request.query_params.get('limit', 50))

    products = Product.objects.filter(
        production_type__isnull=True,
        type='product',
        archived=False,
    ).values('id', 'name', 'group')[offset:offset + limit]

    types = list(ProductType.objects.values_list('name', flat=True))
    total = Product.objects.filter(production_type__isnull=True, type='product', archived=False).count()

    return JsonResponse({
        'products': list(products),
        'types': types,
        'total': total,
        'offset': offset,
        'limit': limit,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def set_product_types(request):
    """Массовое назначение типов продуктам. {assignments: [{product_id: 1, type_name: "Диван"}, ...]}"""
    assignments = request.data.get('assignments', [])
    updated = 0
    skipped = 0

    type_cache = {}
    for a in assignments:
        pid = a.get('product_id')
        type_name = (a.get('type_name') or '').strip()

        if not pid or not type_name or type_name == 'null':
            skipped += 1
            continue

        if type_name not in type_cache:
            try:
                type_cache[type_name] = ProductType.objects.get(name=type_name)
            except ProductType.DoesNotExist:
                skipped += 1
                continue

        Product.objects.filter(pk=pid).update(production_type=type_cache[type_name])
        updated += 1

    return JsonResponse({'updated': updated, 'skipped': skipped})


@api_view(['GET'])
def get_product_norms(request, product_id):
    """Нормативы для конкретного изделия: дефолтные (из типа) + переопределения"""
    try:
        product = Product.objects.select_related('production_type').get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Изделие не найдено'}, status=404)

    departments = list(Department.objects.order_by('ordering', 'name').values_list('name', flat=True))

    # Дефолтные нормативы из ProductType
    defaults = {}
    if product.production_type:
        for n in ProductionNorm.objects.filter(product_type=product.production_type):
            defaults[n.department] = n.hours_per_unit

    # Переопределения
    overrides_qs = ProductNormOverride.objects.filter(product=product)
    overrides = {o.department: o.hours_per_unit for o in overrides_qs}

    rows = []
    for dept in departments:
        rows.append({
            'department': dept,
            'default': defaults.get(dept, 0),
            'override': overrides.get(dept),
        })

    return JsonResponse({
        'product_id': product.id,
        'product_name': product.name,
        'product_type': product.production_type.name if product.production_type else None,
        'rows': rows,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_product_norms(request, product_id):
    """Сохранить переопределения нормативов для изделия. {overrides: {dept: hours|null}}"""
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Изделие не найдено'}, status=404)

    overrides_data = request.data.get('overrides', {})
    for dept, hours in overrides_data.items():
        if hours is None:
            ProductNormOverride.objects.filter(product=product, department=dept).delete()
        else:
            ProductNormOverride.objects.update_or_create(
                product=product, department=dept,
                defaults={'hours_per_unit': float(hours)},
            )

    return JsonResponse({'success': True})


@api_view(['GET'])
def get_departments(request):
    """Список цехов. ?norms=1 — только участвующие в нормативах"""
    qs = Department.objects.order_by('ordering', 'name')
    if request.query_params.get('norms'):
        qs = qs.filter(has_norms=True)
    departments = list(qs.values_list('name', flat=True))
    return JsonResponse({'departments': departments}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_department_workers(request):
    """Количество рабочих по цехам"""
    departments = list(Department.objects.filter(has_norms=True).order_by('ordering', 'name').values_list('name', flat=True))
    # Создаём записи для новых цехов
    for dept in departments:
        DepartmentWorkers.objects.get_or_create(department=dept, defaults={'workers_count': 1})

    rows = list(DepartmentWorkers.objects.filter(department__in=departments).values('department', 'workers_count', 'target_load_days'))
    return JsonResponse({'rows': rows}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_department_workers(request):
    """Обновить количество рабочих. {rows: [{department: "Сборка", workers_count: 5}, ...]}"""
    rows = request.data.get('rows', [])
    for row in rows:
        dept = row.get('department', '').strip()
        count = int(row.get('workers_count', 1))
        if dept:
            DepartmentWorkers.objects.update_or_create(
                department=dept, defaults={'workers_count': max(count, 0)}
            )
    return JsonResponse({'success': True})


@api_view(['POST'])
def update_target_load(request):
    """Обновить целевую загрузку цехов. {loads: {department: days, ...}}"""
    loads = request.data.get('loads', {})
    for dept, days in loads.items():
        days = max(1, min(14, int(days)))
        DepartmentWorkers.objects.filter(department=dept).update(target_load_days=days)
    return JsonResponse({'success': True})


# ─── Chart ────────────────────────────────────────────────────────

def _invert_graph(graph):
    """Из 'A → [B, C]' получить {B: [A], C: [A]} (зависимости)."""
    deps = {}
    for src, targets in graph.items():
        for tgt in targets:
            if tgt not in deps:
                deps[tgt] = []
            deps[tgt].append(src)
    return deps


@api_view(['GET'])
def get_chart_data(request):
    """Сетка загрузки цехов с раскладкой заказов по дням и учётом графа зависимостей."""
    import math

    departments = list(
        Department.objects.filter(has_norms=True).order_by('ordering', 'name').values_list('name', flat=True)
    )

    # Нормативы
    norms = {}
    for n in ProductionNorm.objects.select_related('product_type').all():
        if n.product_type.name not in norms:
            norms[n.product_type.name] = {}
        norms[n.product_type.name][n.department] = n.hours_per_unit

    overrides = {}
    for o in ProductNormOverride.objects.all():
        overrides[(o.product_id, o.department)] = o.hours_per_unit

    # Workers → capacity
    workers = {dw.department: dw.workers_count for dw in DepartmentWorkers.objects.all()}
    WORK_HOURS = 8
    capacity = {dept: workers.get(dept, 1) * WORK_HOURS for dept in departments}

    # Графы
    workflows = {}
    for pt in ProductType.objects.all():
        if pt.workflow_graph:
            workflows[pt.name] = pt.workflow_graph

    # Weights для сортировки
    weights = {}
    for e in AiPlanEntry.objects.all():
        weights[e.order_product_id] = e.sort_weight

    # Заказы
    order_products = OrderProduct.objects.filter(
        status='0'
    ).select_related('product', 'product__production_type', 'order').prefetch_related('product__product_pictures')

    # Собрать данные по каждому заказу: по каждому цеху — remaining и hours
    order_dept_data = []  # [{op, series_id, product_type, weight, depts: {dept: {remaining, hours, picture, order_num, name}}}]

    for op in order_products:
        assignments = Assignment.objects.filter(order_product=op)
        product_type_name = op.product.production_type.name if op.product.production_type else None
        pic = op.product.product_pictures.first()
        picture_url = pic.thumbnail.url if pic else None
        weight = weights.get(op.id, 500)

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

        depts = {}
        for dept_name, status in dept_info.items():
            remaining = status['all'] - status['ready']
            if remaining <= 0:
                continue
            # Часы
            override_key = (op.product_id, dept_name)
            if override_key in overrides:
                hours_per = overrides[override_key]
            elif product_type_name and dept_name in norms.get(product_type_name, {}):
                hours_per = norms[product_type_name][dept_name]
            else:
                hours_per = 1  # fallback
            hours = remaining * hours_per
            depts[dept_name] = {
                'remaining': remaining,
                'hours': hours,
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

    # Сортировка по весу (высший приоритет первый)
    order_dept_data.sort(key=lambda x: x['weight'], reverse=True)

    # --- Раскладка по дням с учётом графа ---
    # Для каждого заказа: finish_day[series_id][dept] = день когда заказ закончится в этом цехе
    finish_day = {}  # {series_id: {dept: int}}

    # Для каждого цеха: текущий день и оставшийся capacity на текущий день
    dept_state = {}
    for dept in departments:
        dept_state[dept] = {
            'current_day': 0,
            'remaining_cap': capacity.get(dept, WORK_HOURS),
            'days': [],  # [{orders: [...], hours: float}]
        }

    def ensure_day(dept, day_idx):
        """Убедиться что день существует в массиве."""
        state = dept_state[dept]
        while len(state['days']) <= day_idx:
            state['days'].append({'orders': [], 'hours': 0})

    def get_earliest_start(order, dept):
        """Определить самый ранний день когда заказ может начаться в цехе (по графу)."""
        sid = order['series_id']
        pt = order['product_type']
        wf = workflows.get(pt)
        if not wf:
            return 0
        # Инвертировать граф: найти от кого зависит dept
        deps = _invert_graph(wf)
        dep_depts = deps.get(dept, [])
        earliest = 0
        for dep_dept in dep_depts:
            if dep_dept in ('Старт', 'Готово'):
                continue
            # Проверить: когда заказ закончится в dep_dept
            if sid in finish_day and dep_dept in finish_day[sid]:
                earliest = max(earliest, finish_day[sid][dep_dept])
        return earliest

    # Проходим по цехам в порядке графа (topological order)
    # Чтобы зависимости были уже рассчитаны
    def get_topo_order(depts, workflows):
        """Топологическая сортировка цехов по всем графам."""
        all_edges = {}
        for wf in workflows.values():
            for src, targets in wf.items():
                for tgt in targets:
                    if tgt not in all_edges:
                        all_edges[tgt] = set()
                    all_edges[tgt].add(src)

        # Kahn's algorithm
        in_degree = {d: 0 for d in depts}
        adj = {d: [] for d in depts}
        for d in depts:
            for dep in all_edges.get(d, []):
                if dep in depts:
                    in_degree[d] += 1
                    adj[dep].append(d)

        queue = [d for d in depts if in_degree[d] == 0]
        result = []
        while queue:
            queue.sort()  # стабильность
            node = queue.pop(0)
            result.append(node)
            for neighbor in adj[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Добавить цеха, которых нет в графах
        for d in depts:
            if d not in result:
                result.append(d)
        return result

    topo_depts = get_topo_order(departments, workflows)

    for dept in topo_depts:
        cap = capacity.get(dept, WORK_HOURS)
        # Заказы для этого цеха, отсортированные по весу
        dept_orders = [(o, o['depts'][dept]) for o in order_dept_data if dept in o['depts']]

        # Группируем по earliest_start_day и внутри — по весу
        for order, info in dept_orders:
            earliest = get_earliest_start(order, dept)
            hours_left = info['hours']
            sid = order['series_id']

            # Начинаем с earliest day
            day = earliest
            while hours_left > 0:
                ensure_day(dept, day)
                day_data = dept_state[dept]['days'][day]

                # Сколько часов можно вместить в этот день
                day_used = day_data['hours']
                day_free = cap - day_used
                if day_free <= 0:
                    day += 1
                    continue

                take = min(hours_left, day_free)
                # Добавить заказ в ячейку
                day_data['orders'].append({
                    'name': order['name'],
                    'order': order['order'],
                    'picture': order['picture'],
                    'count': info['remaining'],
                })
                day_data['hours'] += take
                hours_left -= take

                if hours_left <= 0:
                    # Заказ закончился в этом цехе на этом дне
                    if sid not in finish_day:
                        finish_day[sid] = {}
                    finish_day[sid][dept] = day + 1  # следующий день — можно начинать зависимый цех
                else:
                    day += 1

    # Построить grid
    total_days = max((len(s['days']) for s in dept_state.values()), default=1)

    grid = {}
    for dept in departments:
        state = dept_state[dept]
        cap = capacity.get(dept, WORK_HOURS)
        row = []
        for d in range(total_days):
            if d < len(state['days']):
                cell = state['days'][d]
                hours = cell['hours']
                # Определить load
                if hours >= cap * 1.2:
                    load = 'overload'
                elif hours >= cap * 0.5:
                    load = 'full'
                elif hours > 0:
                    load = 'light'
                else:
                    load = 'empty'
                row.append({
                    'orders': cell['orders'],
                    'load': load,
                    'hours': round(hours, 1),
                })
            else:
                row.append({'orders': [], 'load': 'empty', 'hours': 0})
        grid[dept] = row

    return JsonResponse({
        'departments': departments,
        'total_days': total_days,
        'grid': grid,
    }, json_dumps_params={"ensure_ascii": False})


# ─── Workflow graph ───────────────────────────────────────────────

WORKFLOW_FULL = {
    "Старт": ["Пила", "Лазер", "Крой", "ППУ", "Столярка"],
    "Пила": ["Сборка"],
    "Лазер": ["Сборка"],
    "Крой": ["Пошив"],
    "ППУ": ["Обивка"],
    "Столярка": ["Малярка"],
    "Сборка": ["Обивка"],
    "Пошив": ["Обивка"],
    "Малярка": ["Обивка"],
    "Обивка": ["Упаковка"],
    "Упаковка": ["Готово"],
}

WORKFLOW_NO_STOL = {
    "Старт": ["Пила", "Лазер", "Крой", "ППУ"],
    "Пила": ["Сборка"],
    "Лазер": ["Сборка"],
    "Крой": ["Пошив"],
    "ППУ": ["Обивка"],
    "Сборка": ["Обивка"],
    "Пошив": ["Обивка"],
    "Обивка": ["Упаковка"],
    "Упаковка": ["Готово"],
}

WORKFLOW_SCHEMAS = {1: WORKFLOW_FULL, 2: WORKFLOW_NO_STOL}


@api_view(['GET'])
def get_workflow(request, product_type_id):
    """Получить граф цехов для типа изделия"""
    try:
        pt = ProductType.objects.get(pk=product_type_id)
    except ProductType.DoesNotExist:
        return JsonResponse({'error': 'Тип не найден'}, status=404)

    current_schema = 0
    if pt.workflow_graph == WORKFLOW_FULL:
        current_schema = 1
    elif pt.workflow_graph == WORKFLOW_NO_STOL:
        current_schema = 2

    return JsonResponse({
        'product_type_id': pt.id,
        'product_type_name': pt.name,
        'graph': pt.workflow_graph,
        'schema': current_schema,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_workflow(request, product_type_id):
    """Привязать схему графа к типу изделия. Body: {schema: 1|2} или {graph: {...}}"""
    try:
        pt = ProductType.objects.get(pk=product_type_id)
    except ProductType.DoesNotExist:
        return JsonResponse({'error': 'Тип не найден'}, status=404)

    schema = request.data.get('schema')
    if schema and int(schema) in WORKFLOW_SCHEMAS:
        pt.workflow_graph = WORKFLOW_SCHEMAS[int(schema)]
    elif 'graph' in request.data:
        pt.workflow_graph = request.data['graph']
    else:
        return JsonResponse({'error': 'Укажите schema (1 или 2) или graph'}, status=400)

    pt.save(update_fields=['workflow_graph'])
    return JsonResponse({'success': True})
