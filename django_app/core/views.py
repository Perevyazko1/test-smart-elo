from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import viewsets
from rest_framework.decorators import api_view

from staff.models import Employee, Audit, Department
from .consumers import ws_send_to_all, EqNotificationActions
from .filters import ProductionStepCommentModelFilter
from .models import (Order, OrderProduct, ProductionStep, Assignment, TechnologicalProcess, Product,
                     ProductionStepComment)
from .serializers import TechProcessSerializer, ProductionStepCommentSerializer
from .services.assignment_generator import AssignmentGenerator
from .services.check_schema import check_schema, compare_schemas
from .services.create_custom_tech_process import create_and_set_tech_process
from .services.update_production_steps import update_production_steps


class ProductionStepCommentViewSet(viewsets.ModelViewSet):
    queryset = ProductionStepComment.objects.all()
    filterset_class = ProductionStepCommentModelFilter
    serializer_class = ProductionStepCommentSerializer


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


def app_error_response(text, code=400):
    return JsonResponse(
        {"error": text},
        status=code,
        json_dumps_params={"ensure_ascii": False}
    )


@api_view(['POST'])
def set_tech_process(request):
    schema = request.data.get('schema')
    product_id = request.data.get('product_id')

    if not product_id:
        return app_error_response('Ошибка. Не указан ID изделия.')

    target_product = Product.objects.filter(pk=product_id)

    if not target_product.exists():
        return app_error_response('Ошибка. Изделие не найдено.')
    else:
        target_product = target_product.first()

    if not check_schema(schema):
        return app_error_response('Ошибка. Передана не корректная схема.')

    active_ops = OrderProduct.objects.filter(
        product=target_product,
        status="0"
    )

    process_edited = False

    if target_product.technological_process:
        process_edited = True
        difference = compare_schemas(
            target_product.technological_process.schema,
            schema,
        )

        """Если имеются удаленные наряды - то проверяем есть ли там в работе или готовое. """
        if difference['removed']:
            for key in difference['removed'].keys():
                department = Department.objects.get(name=key)
                assignments = Assignment.objects.filter(
                    order_product__in=active_ops,
                    department=department,
                )
                active_assignments = assignments.exclude(status="await")

                if active_assignments.exists():
                    report = {}
                    for assignment in assignments:
                        dept_name = assignment.department.name
                        if dept_name not in report:
                            report[dept_name] = 0
                        report[dept_name] += 1

                    error_msg = "Ошибка. Для изменения тех процесса устраните замечание:\n"
                    error_msg += "Имеются наряды в работе/готовые в отделах:\n"

                    for dept, count in report.items():
                        error_msg += f"{dept}: {count}шт\n"

                    return app_error_response(error_msg)

                """В случае если нарушений не найдено - удаляем наряды с этими отделами. """
                assignments.delete()
        else:
            pass

    """Создаем или находим техпроцесс, задаем его товару"""
    technological_process = create_and_set_tech_process(
        schema=schema,
        product=target_product
    )
    """Обновляем этапы производства создавая новые и изменяя текущие согласно схеме. """
    target_product.refresh_from_db()
    update_production_steps(target_product)

    Audit.objects.create(
        employee=request.user,
        audit_type="edit",
        details=f"Назначил технологический процесс: {technological_process.name}, "
                f"для изделия: {target_product.name}"
    )

    for order_product in active_ops:
        AssignmentGenerator().init_order_product_assignments(order_product=order_product)
        if process_edited:
            actualized_assembled(order_product)
        ws_send_to_all({
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        })

    serializer = TechProcessSerializer
    data = serializer(technological_process, context={'request': request}).data

    return JsonResponse({
        "data": data
    }, json_dumps_params={"ensure_ascii": False})


def actualized_assembled(order_product: OrderProduct):
    product = order_product.product

    constructor_assignment = Assignment.objects.filter(
        order_product__product=product,
        department__number=1,
        inspector__isnull=True,
    )

    if constructor_assignment.exists():
        active_ops = OrderProduct.objects.filter(
            product=product,
            status="0"
        )
        other_assignments = Assignment.objects.filter(
            order_product__in=active_ops,
        ).exclude(id=constructor_assignment.first().id)
        other_assignments.update(assembled=False)
        return False

    production_steps = ProductionStep.objects.filter(
        product=product,
        is_active=True,
    ).exclude(department__number__in=[0, 1, 50])

    for ps in production_steps:
        current_count = Assignment.objects.filter(
            assembled=True,
            order_product=order_product,
            department=ps.department,
        ).count()

        previous_pss = ProductionStep.objects.filter(
            product=product,
            next_steps=ps.department,
            is_active=True,
        )
        min_count = order_product.quantity

        for previous_ps in previous_pss:
            if previous_ps.department.number == 0:
                continue
            ready_count = Assignment.objects.filter(
                inspector__isnull=False,
                order_product=order_product,
                department=previous_ps.department,
            ).count()
            print(previous_ps.department.name, ready_count)
            min_count = min(min_count, ready_count)

        print(ps.department.name, current_count, min_count)
        if not current_count == min_count:
            assembled = current_count < min_count

            number_from = min(current_count, min_count)

            assignments = Assignment.objects.filter(
                order_product=order_product,
                department=ps.department,
                number__gt=number_from,
            ).order_by('number')

            assignments.update(assembled=assembled)

    return True

