from django.core.cache import cache
from django.db.models import Q

from core.models import OrderProduct
from core.pages.assignments_page.serializers import SimpleAssignmentSerializer
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee


def get_eq_card_assignments(eq_params: dict, target_list: str, order_product: OrderProduct):
    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    match target_list:
        case 'await':
            return _handle_await(eq_params, order_product)
        case 'in_work':
            return _handle_in_work(eq_params, order_product)
        case 'distribute':
            return _handle_distribute(eq_params, order_product)
        case 'ready':
            return _handle_ready(eq_params, order_product)


def _handle_await(eq_params, order_product):
    cache_key = (
        f'eq_card_{order_product.id}_{eq_params["department"].id}_assignments_await_{eq_params['assembled']}'
    )
    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        cache_key += f'_{eq_params['view_mode_key']}'

    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    if eq_params['view_mode_key'] == 'boss':
        if eq_params['assembled']:
            assignments = order_product.assignments.filter(
                department=eq_params['department'], status='await'
            )[:30]
        else:
            assignments = order_product.assignments.filter(
                department=eq_params['department'], status='await', assembled=True
            )[:30]
    elif eq_params['view_mode_key'] == 'unfinished':
        assignments = order_product.assignments.filter(
            department=eq_params['department'], status='await'
        )[:30]
    else:
        if eq_params['assembled']:
            assignments = order_product.assignments.filter(
                department=eq_params['department'], status='await'
            )[:30]
        else:
            assignments = order_product.assignments.filter(
                department=eq_params['department'], status='await', assembled=True
            )[:30]

    result = SimpleAssignmentSerializer(assignments, many=True).data
    """Кешируем результат. """
    cache.set(cache_key, result, timeout=60 * 60 * 8)

    return result


def _handle_in_work(eq_params, order_product):
    cache_key = (
        f'eq_card_{order_product.id}_{eq_params["department"].id}_assignments_in_work_'
    )
    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        cache_key += f"_{eq_params['user'].id}"
    else:
        cache_key += f"_{eq_params['view_mode_key']}"

    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    assignments = order_product.assignments
    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        assignments = assignments.filter(
            Q(
                status="in_work",
                department=eq_params['department'],
                executor=eq_params['user'],
            ) |
            Q(
                status="in_work",
                department=eq_params['department'],
                co_executors__co_executor=eq_params['user'],
            )
        ).distinct()
    else:
        assignments = assignments.filter(
            status="in_work",
            department=eq_params['department'],
        ).distinct()

    result = SimpleAssignmentSerializer(assignments, many=True).data
    """Кешируем результат. """
    cache.set(cache_key, result, timeout=60 * 60 * 8)

    return result


def _handle_distribute(eq_params, order_product):
    return _handle_in_work(eq_params, order_product)


def _handle_ready(eq_params, order_product):
    week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()
    current_week = GetWeekInfo(week=None, year=None).execute()

    cache_key = (
        f'eq_card_{order_product.id}_{eq_params["department"].id}_assignments_ready_'
        f'{week_info.week}_{week_info.year}'
    )
    if current_week.week == week_info.week and current_week.year == week_info.year:
        cache_key += '_current'
    else:
        cache_key += '_not_current'

    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        cache_key += f"_{eq_params['user'].id}"
    else:
        cache_key += f"_{eq_params['view_mode_key']}"

    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    if eq_params['view_mode_key'] not in ["boss", "unfinished"]:
        if current_week.week == week_info.week and current_week.year == week_info.year:
            assignments = order_product.assignments.filter(
                Q(
                    tariffication_date__gt=week_info.date_range[0],
                    tariffication_date__lte=week_info.date_range[1],
                    status='ready',
                    executor=eq_params['user'],
                    department=eq_params['department'],
                ) |
                Q(
                    tariffication_date__isnull=True,
                    executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                ) |
                Q(
                    tariffication_date__gt=week_info.date_range[0],
                    tariffication_date__lte=week_info.date_range[1],
                    co_executors__co_executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                ) |
                Q(
                    tariffication_date__isnull=True,
                    co_executors__co_executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                )
            ).distinct()
        else:
            assignments = order_product.assignments.filter(
                Q(
                    tariffication_date__gt=week_info.date_range[0],
                    tariffication_date__lte=week_info.date_range[1],
                    executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                ) |
                Q(
                    tariffication_date__gt=week_info.date_range[0],
                    tariffication_date__lte=week_info.date_range[1],
                    co_executors__co_executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                )

            ).distinct()
    elif eq_params['view_mode_key'] == "boss":
        if current_week.week == week_info.week and current_week.year == week_info.year:
            assignments = order_product.assignments.filter(
                Q(
                    tariffication_date__gt=week_info.date_range[0],
                    tariffication_date__lte=week_info.date_range[1],
                    department=eq_params['department'],
                    status='ready',
                ) |
                Q(
                    department=eq_params['department'],
                    status='ready',
                    tariffication_date__isnull=True,
                )
            ).distinct()
        else:
            assignments = order_product.assignments.filter(
                tariffication_date__gt=week_info.date_range[0],
                tariffication_date__lte=week_info.date_range[1],
                department=eq_params['department'],
                status='ready',
            ).distinct()
    else:
        assignments = order_product.assignments.filter(
            department=eq_params['department'],
            status="ready",
            tariffication_date__isnull=True,
        ).distinct()

    result = SimpleAssignmentSerializer(assignments, many=True).data
    """Кешируем результат. """
    cache.set(cache_key, result, timeout=60 * 60 * 8)

    return result
