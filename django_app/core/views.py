from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view

from staff.models import Employee, Audit, Department
from .consumers import ws_group_updates, ws_send_to_all, EqNotificationActions
from .models import Order, OrderProduct, ProductionStep, Assignment, TechnologicalProcess, Product
from .serializers import TechProcessSerializer
from .services.assignment_generator import AssignmentGenerator
from .services.check_schema import check_schema
from .services.create_custom_tech_process import create_and_set_tech_process
from .services.update_production_steps import update_production_steps


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
    department_id = request.query_params.get('department_id')

    department = Department.objects.get(id=department_id)
    order_product = OrderProduct.objects.get(series_id=series_id)

    employees = Employee.objects.filter(
        departments=department
    )

    department_info = []

    for employee in employees:
        employee_assignments = Assignment.objects.filter(
            order_product=order_product,
            executor=employee,
            department=department,
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
        is_active=True,
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
                "assembled": department_assignments.filter(status="await", assembled=True).count(),
                "await": department_assignments.filter(status="await", assembled=False).count(),
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
    product_id = request.data.get('product_id')

    active_order_products = OrderProduct.objects.filter(
        status="0",
        product_id=product_id,
    )

    assignments_with_executor = Assignment.objects.filter(
        order_product__in=active_order_products,
        status="ready",
    ).exclude(department__number=1)

    if assignments_with_executor.exists():
        order_product_ids = []
        result_numbers = ''
        for assignment in assignments_with_executor:
            if assignment.order_product.id not in order_product_ids:
                result_numbers += f"{assignment.order_product.series_id}, "
                order_product_ids.append(assignment.order_product.id)

        return JsonResponse(
            {
                "error": f'Ошибка изменения технологического процесса. \n'
                         f'Для изменения технологического процесса устраните следующие замечания: \n'
                         f'Заказ(ы): {result_numbers}. \n'
                         f'Имеются отмеченные готовые наряды в кол-ве {assignments_with_executor.count()} шт.'
            },
            status=400,
            json_dumps_params={"ensure_ascii": False}
        )

    if check_schema(schema):
        product = Product.objects.get(pk=product_id)
        if product.technological_process:
            """Если происходит изменение технологического процесса, проверяем какие отделы были исключены. """
            excluded_departments = []
            for new_department_name in schema:
                if new_department_name not in product.technological_process.schema:
                    excluded_departments.append(new_department_name)

            if excluded_departments:
                """Если таковы имеются проверяем, есть ли в них назначенные наряды. """
                assignments_cant_delete_by_policy = Assignment.objects.filter(
                    order_product__in=active_order_products,
                    department__name__in=excluded_departments,
                    executor__isnull=False
                )
                if assignments_cant_delete_by_policy.exists():
                    """Если таковы имеются - отправляем 400 статус. """
                    order_product_ids = []
                    result_numbers = ''
                    for assignment in assignments_cant_delete_by_policy:
                        if assignment.order_product.id not in order_product_ids:
                            result_numbers += f"{assignment.order_product.series_id}, "
                            order_product_ids.append(assignment.order_product.id)

                    return JsonResponse(
                        {
                            "error": f'Ошибка изменения технологического процесса. \n'
                                     f'Для изменения технологического процесса устраните следующие замечания: \n'
                                     f'Заказ(ы): {result_numbers}. \n'
                                     f'В исключенных отделах: {excluded_departments} имеются наряды в работе. \n'
                                     f'Данные наряды должны быть возвращены в блок ожидания. \n'
                        },
                        status=400,
                        json_dumps_params={"ensure_ascii": False}
                    )
                else:
                    """Если таковых нет - удаляем такие наряды и приступаем к инициализации нового техпроцесса. """
                    Assignment.objects.filter(
                        order_product__in=active_order_products,
                        department__name__in=excluded_departments,
                    ).delete()

        """Получаем или создаем технологический процесс. Присваиваем его изделию. """
        technological_process = create_and_set_tech_process(schema=schema, product=product)
        """Обновляем этапы производства создавая новые и изменяя текущие согласно схеме. """
        product.refresh_from_db()
        update_production_steps(product)

        Audit.objects.create(
            employee=request.user,
            audit_type="edit",
            details=f"Назначил технологический процесс: {technological_process.name}, "
                    f"для изделия: {technological_process.product_set.first().name}"
        )

        for order_product in active_order_products:
            AssignmentGenerator().init_order_product_assignments(order_product=order_product)
            ws_send_to_all({
                'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                'data': order_product.id,
            })
        serializer = TechProcessSerializer
        data = serializer(technological_process, context={'request': request}).data

        return JsonResponse({
            "data": data
        }, json_dumps_params={"ensure_ascii": False})

    else:
        return JsonResponse({"error": 'Не корректная схема'}, json_dumps_params={"ensure_ascii": False})
