from django.db.models import Count, Q

from django.core.cache import cache
from core.models import OrderProduct, Assignment, ProductionStep
from staff.models import Department


def get_eq_card_info(order_product: OrderProduct, department: Department):
    cache_key = f'eq_card_info_{order_product.id}_{department.id}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    production_step = ProductionStep.objects.filter(
        product=order_product.product,
        department=department
    ).first()
    if production_step:
        if production_step.proposed_tariff:
            proposed_tariff = production_step.proposed_tariff.amount or 0
        else:
            proposed_tariff = 0

        if production_step.confirmed_tariff:
            tariff = production_step.confirmed_tariff.amount or 0
        else:
            tariff = 0
    else:
        proposed_tariff = 0
        tariff = 0

    assignments = Assignment.objects.filter(
        order_product=order_product,
        department=department,
    ).values(
        'executor_id',
        'executor__last_name',
        'executor__first_name',
        'executor__patronymic',
    ).annotate(
        count_all=Count('id'),
        count_in_work=Count('id', filter=Q(status='in_work')),
        count_await=Count('id', filter=Q(status='await')),
        count_ready=Count('id', filter=Q(status='ready')),
    )

    employees_info = []
    count_all = 0
    count_in_work = 0
    count_ready = 0
    count_await = 0

    for assignment in assignments:
        count_all += assignment['count_all']
        count_in_work += assignment['count_in_work']
        count_ready += assignment['count_ready']
        count_await += assignment['count_await']

        # Формируем данные для каждого сотрудника
        if assignment['executor_id']:
            last_name = assignment['executor__last_name'][0] if assignment['executor__last_name'] else ""
            first_name = assignment['executor__first_name'][0] if assignment['executor__first_name'] else ""
            patronymic = assignment['executor__patronymic'][0] if assignment['executor__patronymic'] else ""

            employees_info.append({
                "count_in_work": assignment['count_in_work'],
                "count_all": assignment['count_all'],
                'full_name': f'{last_name}{first_name}{patronymic}'
            })

    further_packaging = False
    if production_step:
        further_packaging = production_step.next_step.all().filter(
            department__name="Упаковка"
        ).exists()

    result = {
        "further_packaging": further_packaging,
        "tariff": tariff,
        "proposed_tariff": proposed_tariff,
        "production_step__id": production_step.id if production_step else 0,
        "count_all": count_all,
        "count_in_work": count_in_work,
        "count_ready": count_ready,
        "count_await": count_await,
        "employees_info": employees_info
    }

    cache.set(cache_key, result, timeout=60 * 60 * 24)
    return result
