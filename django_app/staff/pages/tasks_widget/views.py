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
from tasks.models import Task


@api_view(['GET'])
def check_tasks_exists(request):
    """Check user has some tasks. """
    user: Employee = request.user

    if user.groups.filter(name="Визирование нарядов").exists():
        if Assignment.objects.filter(
                department__in=user.departments.all(),
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

    if user.groups.filter(name="Первичная тарификация").exists():
        active_products = Product.objects.filter(
            order_products__status="0"
        ).distinct()

        target_departments = user.departments.filter(
            piecework_wages=True
        )
        if ProductionStep.objects.filter(
                product__in=active_products,
                department__in=target_departments,
                proposed_tariff__isnull=True
        ).distinct().exists():
            return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

    if user.groups.filter(name="Подтверждение тарификаций").exists():
        if ProductionStep.objects.filter(
                proposed_tariff__isnull=False,
        ).exclude(
            confirmed_tariff__amount=models.F('proposed_tariff__amount')
        ).exists():
            return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

        if Task.objects.filter(
                proposed_tariff__isnull=False,
        ).exclude(
            confirmed_tariff__amount=models.F('proposed_tariff__amount')
        ).exclude(
            status='4',
        ).exists():
            return JsonResponse({'result': True}, json_dumps_params={"ensure_ascii": False})

    return JsonResponse({'result': False}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_tasks_count(request):
    """Get tasks count for user. """
    user: Employee = request.user

    result = {}

    if user.groups.filter(name="Визирование нарядов").exists():
        await_visa = Assignment.objects.filter(
            department__in=user.departments.all(),
            inspector__isnull=True,
            status="ready"
        ).count()
        if await_visa:
            result['await_visa'] = await_visa

    if user.groups.filter(name="Изменение техпроцессов"):
        await_tech_process = Assignment.objects.filter(
            inspector__isnull=True,
            order_product__product__technological_process__isnull=True,
        ).count()
        if await_tech_process:
            result['await_tech_process'] = await_tech_process

    if user.groups.filter(name="Первичная тарификация").exists():
        active_products = Product.objects.filter(
            order_products__status="0"
        ).distinct()

        target_departments = user.departments.filter(
            piecework_wages=True
        )
        total_tariff_count = ProductionStep.objects.filter(
            product__in=active_products,
            department__in=target_departments,
            proposed_tariff__isnull=True
        ).distinct().count()

        if total_tariff_count:
            result['await_tariff'] = total_tariff_count

    if user.groups.filter(name="Подтверждение тарификаций").exists():
        await_tariff_visa = ProductionStep.objects.filter(
            proposed_tariff__isnull=False,
        ).exclude(
            confirmed_tariff__amount=models.F('proposed_tariff__amount')
        ).count()

        if await_tariff_visa:
            result['await_tariff_visa'] = await_tariff_visa

        await_tasks_visa = Task.objects.filter(
            proposed_tariff__isnull=False,
        ).exclude(
            confirmed_tariff__amount=models.F('proposed_tariff__amount')
        ).exclude(
            status='4',
        ).count()

        if await_tasks_visa:
            result['await_tasks_visa'] = await_tasks_visa

    return JsonResponse(result, json_dumps_params={"ensure_ascii": False})
