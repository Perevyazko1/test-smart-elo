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

    return result


def _handle_in_work(eq_params, order_product):
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

    return result


def _handle_distribute(eq_params, order_product):
    return _handle_in_work(eq_params, order_product)


def _handle_ready(eq_params, order_product):
    week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()
    current_week = GetWeekInfo(week=None, year=None).execute()
    show_all = eq_params.get('show_all') and eq_params.get('project_filter')

    assignments = _get_ready_assignments(eq_params, order_product, week_info, current_week, show_all)
    result = SimpleAssignmentSerializer(assignments, many=True).data

    return result


def _get_ready_assignments(eq_params, order_product, week_info, current_week, show_all):
    base_filter = Q(department=eq_params['department'], status='ready')
    date_filter = Q(
        tariffication_date__date__gte=week_info.date_range[0].date(),
        tariffication_date__date__lte=week_info.date_range[1].date()
    )

    if eq_params['view_mode_key'] not in ["boss", "unfinished"]:
        return _get_user_assignments(eq_params, order_product, base_filter, date_filter, current_week, week_info,
                                     show_all)
    elif eq_params['view_mode_key'] == "boss":
        return _get_boss_assignments(order_product, base_filter, date_filter, current_week, week_info,
                                     show_all)
    else:
        return order_product.assignments.filter(
            base_filter,
            tariffication_date__isnull=True
        ).distinct()


def _get_user_assignments(eq_params, order_product, base_filter, date_filter, current_week, week_info, show_all):
    user_filter = (
            Q(executor=eq_params['user']) |
            Q(co_executors__co_executor=eq_params['user'])
    )

    if show_all:
        return order_product.assignments.filter(base_filter & user_filter).distinct()

    is_current = current_week.week == week_info.week and current_week.year == week_info.year
    if is_current:
        return order_product.assignments.filter(
            (date_filter & base_filter & user_filter) |
            (base_filter & user_filter & Q(tariffication_date__isnull=True))
        ).distinct()
    else:
        return order_product.assignments.filter(
            date_filter & base_filter & user_filter
        ).distinct()


def _get_boss_assignments(order_product, base_filter, date_filter, current_week, week_info, show_all):
    if show_all:
        return order_product.assignments.filter(base_filter).distinct()

    is_current = current_week.week == week_info.week and current_week.year == week_info.year
    if is_current:
        return order_product.assignments.filter(
            (date_filter & base_filter) |
            (base_filter & Q(tariffication_date__isnull=True))
        ).distinct()
    else:
        return order_product.assignments.filter(
            date_filter & base_filter
        ).distinct()
