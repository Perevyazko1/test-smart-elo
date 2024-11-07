"""Views for tasks widget. """
from django.http import JsonResponse
from django.db import models
from rest_framework.decorators import api_view
from core.models import (
    Assignment,
    Product,
    ProductionStep,
    OrderProduct,
)

from staff.models import Employee


@api_view(['GET'])
def check_tasks_exists(request):
    """Check user has some tasks. """
    user: Employee = request.user

    if user.groups.filter(name="Визирование нарядов").exists():
        if Assignment.objects.filter(
                department=user.current_department,
                inspector__isnull=True,
                status="ready"
        ).exists():
            return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

    if user.groups.filter(name="Изменение техпроцессов"):
        if Assignment.objects.filter(
                inspector__isnull=True,
                order_product__product__technological_process__isnull=True,
        ).exists():
            return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

    if user.current_department.piecework_wages:
        if user.groups.filter(name="Первичная тарификация").exists():
            active_order_products = OrderProduct.objects.filter(
                status="0"
            )
            for order_product in active_order_products:
                if ProductionStep.objects.filter(
                        product=order_product.product,
                        department=user.current_department,
                        proposed_tariff__isnull=True
                ).exists():
                    return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

        if user.groups.filter(name="Подтверждение тарификаций").exists():
            active_order_products = OrderProduct.objects.filter(
                status="0"
            )
            for order_product in active_order_products:
                if ProductionStep.objects.filter(
                        product=order_product.product,
                        proposed_tariff__isnull=False,
                ).exclude(
                    confirmed_tariff__amount=models.F('proposed_tariff__amount')
                ).exists():
                    return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

    return JsonResponse({'result': False}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_tasks_count(request):
    """Get tasks count for user. """
    user: Employee = request.user

    result = {}

    if user.groups.filter(name="Визирование нарядов").exists():
        assignments = Assignment.objects.filter(
            department=user.current_department,
            inspector__isnull=True,
            status="ready"
        )
        if assignments.exists():
            result['await_visa'] = assignments.count()

    if user.groups.filter(name="Изменение техпроцессов"):
        assignments = Assignment.objects.filter(
            inspector__isnull=True,
            order_product__product__technological_process__isnull=True,
        )
        if assignments.exists():
            result['await_tech_process'] = assignments.count()

    if user.current_department.piecework_wages:
        if user.groups.filter(name="Первичная тарификация").exists():
            active_order_products = OrderProduct.objects.filter(
                status="0"
            )

            total_tariff_count = 0
            products_id = []

            for order_product in active_order_products:
                if order_product.product.id in products_id:
                    continue
                products_id.append(order_product.product.id)

                assignments = Assignment.objects.filter(
                    order_product=order_product,
                    department=user.current_department,
                    status__in=['await', 'created', 'in_work']
                ).exists()

                if not assignments:
                    continue

                production_step = ProductionStep.objects.filter(
                    product=order_product.product,
                    department=user.current_department,
                    proposed_tariff__isnull=True
                )
                if production_step.exists():
                    total_tariff_count += 1

            if total_tariff_count:
                result['await_tariff'] = total_tariff_count

        if user.groups.filter(name="Подтверждение тарификаций").exists():
            active_order_products = OrderProduct.objects.filter(
                status="0"
            )

            total_tariff_count = 0
            products_id = []

            for order_product in active_order_products:
                if order_product.product.id in products_id:
                    continue

                products_id.append(order_product.product.id)

                production_step = ProductionStep.objects.filter(
                    product=order_product.product,
                    proposed_tariff__isnull=False,
                ).exclude(
                    confirmed_tariff__amount=models.F('proposed_tariff__amount')
                )
                if production_step.exists():
                    total_tariff_count += 1

            if total_tariff_count:
                result['await_tariff_visa'] = total_tariff_count

    return JsonResponse(result, json_dumps_params={"ensure_ascii": False})
