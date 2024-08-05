"""Get assignments for card. """
from django.db.models import Q

from core.services.get_week_info import GetWeekInfo
from staff.models import Employee

from core.pages.assignments_page.serializers import SimpleAssignmentSerializer
from core.models import (
    OrderProduct,

)


def get_in_work_assignments(assignments, eq_params):
    assignments = assignments.filter(
        status="in_work",
    ).distinct()

    # Если режим просмотра от конкретного пользователя, фильтруем список по пин-коду
    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        executor = eq_params['user']
        assignments = assignments.filter(
            executor=executor,
        )[:30]
    return assignments[:30]


def get_eq_card_assignments(eq_params: dict, target_list: str, order_product: OrderProduct):
    # Делаем проверку на режим просмотра от вида другого пользователя
    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    match target_list:
        case 'await':
            if eq_params['view_mode_key'] == 'boss':
                if eq_params['assembled']:
                    assignments = order_product.assignments.filter(
                        department=eq_params['department'],
                        status='await'
                    )[:30]
                else:
                    assignments = order_product.assignments.filter(
                        department=eq_params['department'],
                        status='await',
                        assembled=True
                    )[:30]
            elif eq_params['view_mode_key'] == 'unfinished':
                assignments = order_product.assignments.filter(
                    department=eq_params['department'],
                    status='await'
                )[:30]
            else:
                if eq_params['assembled']:
                    assignments = order_product.assignments.filter(
                        department=eq_params['department'],
                        status='await'
                    )[:30]
                else:
                    assignments = order_product.assignments.filter(
                        department=eq_params['department'],
                        status='await',
                        assembled=True,
                    )[:30]
            return SimpleAssignmentSerializer(assignments, many=True).data
        case 'in_work':
            assignments = order_product.assignments.filter(
                department=eq_params['department']
            ).distinct()
            assignments = get_in_work_assignments(assignments, eq_params)
            return SimpleAssignmentSerializer(assignments, many=True).data

        case 'distribute':
            assignments = order_product.assignments.filter(
                department=eq_params['department']
            ).distinct()
            assignments = get_in_work_assignments(assignments, eq_params)
            return SimpleAssignmentSerializer(assignments, many=True).data

        case 'ready':
            # Режим просмотра личных нарядов или нарядов сотрудника
            if eq_params['view_mode_key'] not in ["boss", "unfinished"]:
                week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()
                current_week = GetWeekInfo(week=None, year=None).execute()

                if current_week.week == week_info.week and current_week.year == week_info.year:
                    assignments = order_product.assignments.filter(
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
                    assignments = order_product.assignments.filter(
                        executor=eq_params['user'],
                        department=eq_params['department'],
                        status='ready',
                        inspect_date__gt=week_info.date_range[0],
                        inspect_date__lte=week_info.date_range[1],
                    ).distinct().order_by('-inspector')
                return SimpleAssignmentSerializer(assignments, many=True).data

            # Режим просмотра в режиме бригадира
            elif eq_params['view_mode_key'] == "boss":
                current_week = GetWeekInfo(week=None, year=None).execute()
                week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()

                if current_week.week == week_info.week and current_week.year == week_info.year:
                    assignments = order_product.assignments.filter(
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
                    ).distinct().order_by('-inspector')
                else:
                    assignments = order_product.assignments.filter(
                        department=eq_params['department'],
                        status='ready',
                        inspect_date__gt=week_info.date_range[0],
                        inspect_date__lte=week_info.date_range[1],
                    ).distinct().order_by('-inspector')

                return SimpleAssignmentSerializer(assignments, many=True).data

            # Режим просмотра в режиме недоделок
            else:
                assignments = order_product.assignments.filter(
                    department=eq_params['department'],
                    status="ready",
                    inspector__isnull=True,
                ).distinct().order_by('-inspector')[:30]
                return SimpleAssignmentSerializer(assignments, many=True).data
