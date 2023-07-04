from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view

from staff.models import Employee, Audit
from .consumers import ws_group_updates, EqNotificationActions
from .models import Order, OrderProduct, ProductionStep, Assignment, TechnologicalProcess
from .pages.eq_page.services.check_schema import check_schema
from .pages.eq_page.services.create_custom_tech_process import create_custom_tech_process
from .serializers import TechProcessSerializer


def import_orders(request):
    """Импорт заказов из МойСклад"""
    from .api_moy_sklad.services.import_orders import ImportOrders
    ImportOrders().execute()

    return redirect(request.META.get('HTTP_REFERER'))


@api_view(['GET'])
def get_project_filters(request):
    mode = request.query_params.get('mode')

    if mode == 'all':
        projects = list(Order.objects.all().distinct('project').values_list('project', flat=True))
    else:
        projects = list(
            Order.objects
            .filter(order_products__status=0)
            .distinct('project')
            .values_list('project', flat=True)
        )

    result = ['Все проекты']

    result += projects

    return JsonResponse({"data": result}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_op_dep_info(request):
    series_id = request.query_params.get('series_id')
    department_number = request.query_params.get('department_number')

    order_product = OrderProduct.objects.get(series_id=series_id)

    employees = Employee.objects.filter(
        departments__number=department_number
    )

    department_info = []

    for employee in employees:
        employee_assignments = Assignment.objects.filter(
            order_product=order_product,
            executor=employee,
            department__number=department_number,
        )
        department_info.append(
            {
                "id": employee.id,
                "full_name": f"{employee.first_name} {employee.last_name}",
                "in_work": employee_assignments.filter(status="in_work").count(),
                "ready": employee_assignments.filter(status="ready").count(),
                "confirmed": employee_assignments.filter(
                    inspector__isnull=False,
                    status="ready"
                ).count(),
            }
        )

    return JsonResponse({
        "department_info": department_info,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_op_prod_info(request):
    series_id = request.query_params.get('series_id')

    order_product = OrderProduct.objects.get(series_id=series_id)

    production_steps = ProductionStep.objects.filter(
        product=order_product.product,
    ).exclude(department__number=0).exclude(department__number=50)

    production_info = []

    for production_step in production_steps:
        department_assignments = Assignment.objects.filter(
            order_product=order_product,
            department=production_step.department,
        )
        production_info.append(
            {
                "department_name": production_step.department.name,
                "in_work": department_assignments.filter(status="in_work").count(),
                "ready": department_assignments.filter(status="ready").count(),
                "confirmed": department_assignments.filter(
                    inspector__isnull=False,
                    status="ready",
                ).count(),
            }
        )

    return JsonResponse({
        "production_info": production_info,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_tech_processes(request):
    qs = TechnologicalProcess.objects.exclude(image='').order_by('name')
    serializer = TechProcessSerializer
    data = serializer(qs, many=True, context={"request": request}).data

    return JsonResponse({"tech_processes": data}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def set_tech_process(request):
    schema = request.data.get('schema')
    pin_code = request.data.get('pin_code')
    series_id = request.data.get('series_id')

    if check_schema(schema):
        technological_process = create_custom_tech_process(schema=schema, series_id=series_id)
        serializer = TechProcessSerializer
        data = serializer(technological_process, context={'request': request}).data

        Audit.objects.create(
            employee=Employee.objects.get(pin_code=pin_code),
            audit_type="edit",
            details=f"Назначил специальный технологический процесс: {technological_process.name}, "
                    f"для изделия: {technological_process.product_set.first().name}"
        )
        """Делаем рассылку на обновление данных в WS"""
        ws_group_updates(
            pin_code=pin_code,
            notification_data={
                '1': {
                    'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                    'data': series_id,
                }
            }
        )

        return JsonResponse({
            "data": data
        }, json_dumps_params={"ensure_ascii": False})

    else:
        return JsonResponse({"error": 'Не корректная схема'}, json_dumps_params={"ensure_ascii": False})
