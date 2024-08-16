from django.core.cache import cache
from django.db.models import Q

from core.models import OrderProduct
from core.pages.assignments_page.serializers import SimpleAssignmentSerializer
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee


def get_in_work_assignments(assignments, eq_params):
    assignments = assignments.filter(status="in_work").distinct()

    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        executor = eq_params['user']
        assignments = assignments.filter(executor=executor)[:30]
    return assignments[:30]


# @log_time
def get_eq_card_assignments(eq_params: dict, target_list: str, order_product: OrderProduct):
    cache_key = (
        f'assignments_{order_product.id}_{eq_params["department"].id}'
        f'_{target_list}_{eq_params["view_mode_key"]}'
        f'_{eq_params.get("week", "")}_{eq_params.get("year", "")}'
    )
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    assignments = None

    match target_list:
        case 'await':
            assignments = _handle_await(eq_params, order_product)
        case 'in_work':
            assignments = _handle_in_work(eq_params, order_product)
        case 'distribute':
            assignments = _handle_distribute(eq_params, order_product)
        case 'ready':
            assignments = _handle_ready(eq_params, order_product)

    result = SimpleAssignmentSerializer(assignments, many=True).data
    cache.set(cache_key, result, timeout=60 * 60 * 24)

    return result


def _handle_await(eq_params, order_product):
    if eq_params['view_mode_key'] == 'boss':
        if eq_params['assembled']:
            return order_product.assignments.filter(
                department=eq_params['department'], status='await'
            )[:30]
        else:
            return order_product.assignments.filter(
                department=eq_params['department'], status='await', assembled=True
            )[:30]
    elif eq_params['view_mode_key'] == 'unfinished':
        return order_product.assignments.filter(
            department=eq_params['department'], status='await'
        )[:30]
    else:
        if eq_params['assembled']:
            return order_product.assignments.filter(
                department=eq_params['department'], status='await'
            )[:30]
        else:
            return order_product.assignments.filter(
                department=eq_params['department'], status='await', assembled=True
            )[:30]


def _handle_in_work(eq_params, order_product):
    assignments = order_product.assignments.filter(department=eq_params['department']).distinct()
    return get_in_work_assignments(assignments, eq_params)


def _handle_distribute(eq_params, order_product):
    assignments = order_product.assignments.filter(department=eq_params['department']).distinct()
    return get_in_work_assignments(assignments, eq_params)


def _handle_ready(eq_params, order_product):
    current_week = GetWeekInfo(week=None, year=None).execute()
    week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()

    if eq_params['view_mode_key'] not in ["boss", "unfinished"]:
        if current_week.week == week_info.week and current_week.year == week_info.year:
            return order_product.assignments.filter(
                Q(
                    executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                    inspect_date__gt=week_info.date_range[0],
                    inspect_date__lte=week_info.date_range[1],
                ) |
                Q(
                    executor=eq_params['user'],
                    department=eq_params['department'],
                    status='ready',
                    inspector__isnull=True,
                )
            ).distinct().order_by('-inspector')[:30]
        else:
            return order_product.assignments.filter(
                executor=eq_params['user'],
                department=eq_params['department'],
                status='ready',
                inspect_date__gt=week_info.date_range[0],
                inspect_date__lte=week_info.date_range[1],
            ).distinct().order_by('-inspector')[:30]
    elif eq_params['view_mode_key'] == "boss":
        if current_week.week == week_info.week and current_week.year == week_info.year:
            return order_product.assignments.filter(
                Q(
                    department=eq_params['department'],
                    status='ready',
                    inspect_date__gt=week_info.date_range[0],
                    inspect_date__lte=week_info.date_range[1],
                ) |
                Q(
                    department=eq_params['department'],
                    status='ready',
                    inspector__isnull=True,
                )
            ).distinct().order_by('-inspector')[:30]
        else:
            return order_product.assignments.filter(
                department=eq_params['department'],
                status='ready',
                inspect_date__gt=week_info.date_range[0],
                inspect_date__lte=week_info.date_range[1],
            ).distinct().order_by('-inspector')[:30]
    else:
        return order_product.assignments.filter(
            department=eq_params['department'],
            status="ready",
            inspector__isnull=True,
        ).distinct().order_by('-inspector')[:30]
