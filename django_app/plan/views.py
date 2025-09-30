from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view

from core.models import Assignment, OrderProduct, Order, AgentTag
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
        sort_date_trunc=TruncDate('sort_date')
    ).annotate(**department_aggregates).order_by('order_product__series_id', 'sort_date_trunc')

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
        key = f"{group['order_product__series_id']}-{plane_date_key}"

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

        final_waiting = 0
        if final_department:
            final_waiting = Assignment.objects.filter(
                department=final_department,
                order_product=order_product,
                inspector__isnull=True,
            ).count()

        result[key] = {
            "date": sort_date_val,
            "product_name": order_product.product.name,
            "product_picture": picture_url,
            "order": order_product.order.inner_number,
            "series_id": order_product.series_id,
            "price": order_product.price,
            "fabric_name": order_product.main_fabric.name if order_product.main_fabric else "-",
            "fabric_picture": fabric_url,
            "project": order_product.order.project,
            "quantity": order_product.quantity,
            "shipped": order_product.shipped,
            "final_waiting": final_waiting,
            "assignments": assignments_data
        }

    return JsonResponse(result)


@api_view(['POST'])
def set_target_date(request):
    target_date = request.data.get('target_date')
    series_id = request.data.get('series_id')

    if target_date:
        target_datetime = parse_datetime(target_date)
        if target_datetime and timezone.is_naive(target_datetime):
            target_datetime = timezone.make_aware(target_datetime)
    else:
        target_datetime = None

    target_order_product = OrderProduct.objects.get(series_id=series_id)
    Assignment.objects.filter(
        order_product=target_order_product
    ).update(
        sort_date=target_datetime,
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
