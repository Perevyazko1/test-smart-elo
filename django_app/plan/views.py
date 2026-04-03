import json
import logging
import requests

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct, Order, AgentTag, ProductionStep, OrderProductComment
from core.pages.orders_page.serializers import OrderProductCommentSerializer
from core.serializers import AgentTagSerializer
from plan.models import AiPlanEntry, AiPlanConfig
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


@api_view(['POST'])
def generate_ai_plan(request):
    """Отправить данные в Ollama, получить AI-план и сохранить"""
    config = _get_ai_config()

    # Собираем данные о всех активных позициях
    order_products = OrderProduct.objects.filter(
        status='0'
    ).select_related('product', 'order', 'main_fabric')

    orders_info = []
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

        orders_info.append({
            'series_id': op.series_id,
            'product': op.product.name,
            'order': op.order.inner_number if op.order else '',
            'project': op.order.project if op.order else '',
            'client': op.order.agent.name if op.order and hasattr(op.order, 'agent') and op.order.agent else '',
            'quantity': op.quantity,
            'shipped': op.shipped,
            'urgency': op.urgency,
            'price': str(op.price),
            'departments': dept_status,
        })

    prompt = f"""{config.base_prompt}

Вот текущие заказы в производстве (JSON):
{json.dumps(orders_info, ensure_ascii=False, indent=2)}

Проанализируй заказы и верни JSON в таком формате (без markdown, только чистый JSON):
{{
  "summary": "Краткая сводка по общей ситуации на производстве (2-3 предложения)",
  "entries": [
    {{
      "series_id": "ID серии",
      "sort_weight": число от 0 до 100 (важность, 100 = максимальный приоритет),
      "sort_position": порядковый номер в очереди (1 = самый первый),
      "ai_comment": "Краткий комментарий по этому заказу"
    }}
  ]
}}

Учитывай сроки, загрузку цехов, срочность и объём заказов при расстановке приоритетов.
Отвечай только на русском языке. Верни ТОЛЬКО JSON, без пояснений."""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                'model': 'qwen2.5:7b',
                'messages': [{'role': 'user', 'content': prompt}],
                'stream': False,
            },
            timeout=300,
        )
        response.raise_for_status()
        result = response.json()
        ai_text = result.get('message', {}).get('content', '')

        # Парсим JSON из ответа
        ai_text_clean = ai_text.strip()
        if ai_text_clean.startswith('```'):
            ai_text_clean = ai_text_clean.split('\n', 1)[1]
            ai_text_clean = ai_text_clean.rsplit('```', 1)[0]

        ai_data = json.loads(ai_text_clean)

        # Сохраняем сводку
        config.ai_summary = ai_data.get('summary', '')
        config.save(update_fields=['ai_summary', 'updated_at'])

        # Сохраняем записи
        for entry_data in ai_data.get('entries', []):
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
            except OrderProduct.DoesNotExist:
                logger.warning(f'OrderProduct с series_id={sid} не найден')

        return JsonResponse({
            'success': True,
            'summary': ai_data.get('summary', ''),
            'entries_count': len(ai_data.get('entries', [])),
        }, json_dumps_params={"ensure_ascii": False})

    except requests.exceptions.Timeout:
        return JsonResponse({'success': False, 'error': 'Ollama не ответила вовремя (таймаут 5 мин)'}, status=504)
    except json.JSONDecodeError as e:
        logger.error(f'Ошибка парсинга JSON от Ollama: {e}\nОтвет: {ai_text}')
        return JsonResponse({'success': False, 'error': 'AI вернула некорректный JSON', 'raw': ai_text}, status=500)
    except requests.exceptions.ConnectionError:
        return JsonResponse({'success': False, 'error': 'Не удалось подключиться к Ollama'}, status=503)


N8N_WEBHOOK_URL = 'http://n8n:5678/webhook/ai-plan-prompt'


def _collect_orders_context():
    """Собрать краткий контекст по всем активным заказам с текущими AI-весами"""
    order_products = OrderProduct.objects.filter(
        status='0'
    ).select_related('product', 'order', 'main_fabric')

    orders = []
    for op in order_products:
        ai_entry = getattr(op, 'ai_plan_entry', None)
        try:
            ai_entry = op.ai_plan_entry
        except AiPlanEntry.DoesNotExist:
            ai_entry = None

        orders.append({
            'series_id': op.series_id,
            'product': op.product.name,
            'order': op.order.inner_number if op.order else '',
            'project': op.order.project if op.order else '',
            'quantity': op.quantity,
            'urgency': op.urgency,
            'current_weight': ai_entry.sort_weight if ai_entry else 50,
            'current_position': ai_entry.sort_position if ai_entry else 0,
        })
    return orders


@api_view(['POST'])
def process_ai_prompt(request):
    """Обработать текстовый запрос пользователя через n8n → Ollama"""
    user_prompt = request.data.get('prompt', '').strip()
    if not user_prompt:
        return JsonResponse({'success': False, 'error': 'Пустой запрос'}, status=400)

    config = _get_ai_config()
    orders = _collect_orders_context()

    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json={
                'user_prompt': user_prompt,
                'base_prompt': config.base_prompt,
                'orders': orders,
            },
            timeout=300,
        )
        response.raise_for_status()
        ai_data = response.json()

        # Сохраняем сводку
        summary = ai_data.get('summary', '')
        if summary:
            config.ai_summary = summary
            config.save(update_fields=['ai_summary', 'updated_at'])

        # Сохраняем обновлённые записи
        updated = 0
        for entry_data in ai_data.get('entries', []):
            sid = entry_data.get('series_id')
            if not sid:
                continue
            try:
                op = OrderProduct.objects.get(series_id=sid)
                entry, _ = AiPlanEntry.objects.get_or_create(order_product=op)
                entry.sort_weight = entry_data.get('sort_weight', entry.sort_weight)
                entry.sort_position = entry_data.get('sort_position', entry.sort_position)
                entry.ai_comment = entry_data.get('ai_comment', entry.ai_comment)
                entry.save(update_fields=['sort_weight', 'sort_position', 'ai_comment', 'updated_at'])
                updated += 1
            except OrderProduct.DoesNotExist:
                pass

        return JsonResponse({
            'success': True,
            'summary': summary,
            'updated': updated,
            'ai_response': ai_data.get('response', ''),
        }, json_dumps_params={"ensure_ascii": False})

    except requests.exceptions.Timeout:
        return JsonResponse({'success': False, 'error': 'n8n не ответил вовремя'}, status=504)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'n8n вернул некорректный ответ'}, status=500)
    except requests.exceptions.ConnectionError:
        return JsonResponse({'success': False, 'error': 'Не удалось подключиться к n8n'}, status=503)
