from pprint import pprint

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct, Order, AgentTag, ProductionStep
from core.serializers import AgentTagSerializer
from staff.models import Employee
from staff.serializers import EmployeeSerializer


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
    ).first().department

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

    print(new_map)
    print(target_date, quantity, urgency, date_from, series_id, old_urgency)

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

        print(nums, date, urgency)
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
