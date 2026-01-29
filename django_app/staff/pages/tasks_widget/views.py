"""Views for tasks widget. """
from django.http import JsonResponse
from django.db import models
from rest_framework.decorators import api_view
from core.models import (
    Assignment,
    Product,
    ProductionStep,
)

from staff.models import Employee
from tasks.models import Task


@api_view(['GET'])
def check_tasks_exists(request):
    """Check user has some tasks. """
    user: Employee = request.user

    if user.groups.filter(name="Изменение техпроцессов"):
        if Assignment.objects.filter(
                inspector__isnull=True,
                order_product__product__technological_process__isnull=True,
        ).exists():
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

    if user.groups.filter(name="Изменение техпроцессов"):
        await_tech_process = Assignment.objects.filter(
            inspector__isnull=True,
            order_product__product__technological_process__isnull=True,
        ).count()
        if await_tech_process:
            result['await_tech_process'] = await_tech_process

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
