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

    department_names = [
        "Конструктора",
        "Обивка",
        "Пошив",
        "Малярка",
        "Сборка",
        "Упаковка",
    ]

    query_filter = {
        "order_product__status": "0",
        "department__name__in": department_names,
    }

    if project:
        if project == "Без проекта":
            project = ""
        query_filter["order_product__order__project"] = project

    if manager_id:
        owner = Employee.objects.get(id=manager_id)
        query_filter["order_product__order__owner"] = owner
        print(owner)

    assignments = Assignment.objects.filter(
        **query_filter
    ).select_related(
        'department',
        'order_product__product',
        'order_product__order',
        'order_product__main_fabric',
        'order_product__order__owner',
    ).order_by('order_product__series_id', 'sort_date')

    result = {}
    for assignment in assignments:
        order_product = assignment.order_product
        plane_date_key = assignment.sort_date.date() if assignment.sort_date else 'nodate'
        key = f'{order_product.series_id}-{plane_date_key}'

        product_image = order_product.product.product_pictures.first()
        picture_url = None
        if product_image:
            picture_url = product_image.thumbnail.url

        fabric_image = order_product.main_fabric.fabric_pictures.first() if order_product.main_fabric else None
        fabric_url = None
        if fabric_image:
            fabric_url = fabric_image.thumbnail.url

        if key not in result:
            result[key] = {
                "date": assignment.sort_date.date() if assignment.sort_date else None,
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
                "assignments": {}
            }

        department_name = assignment.department.name
        if department_name not in result[key]["assignments"]:
            result[key]["assignments"][department_name] = {"all": 0, "ready": 0, "await": 0}

        result[key]["assignments"][department_name]["all"] += 1
        if assignment.status == "ready":
            if not assignment.inspector:
                result[key]["assignments"][department_name]["await"] += 1
            else:
                result[key]["assignments"][department_name]["ready"] += 1

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
            "result": AgentTagSerializer(data=agents, many=True).data
        },
        json_dumps_params={
            "ensure_ascii": False
        }
    )
