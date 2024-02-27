from core.models import OrderProduct
from core.pages.assignments_page.serializers import AssignmentExtendedSerializer
from core.pages.new_eq.services.get_eq_req_params import RequestParams
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee


def get_await_assignments(assignments):
    return assignments.filter(
        status="await",
    ).distinct()


def get_in_work_assignments(assignments, eq_params):
    assignments = assignments.filter(
        status="in_work",
    ).distinct()

    print(eq_params)

    # Если режим просмотра от конкретного пользователя, фильтруем список по пин-коду
    if eq_params.view_mode_key not in ['boss', 'unfinished']:
        assignments = assignments.filter(
            executor__pin_code=eq_params.pin_code,
        )
    return assignments


def get_ready_assignments(assignments, eq_params):
    assignments = assignments.filter(
        status="ready",
    ).distinct()

    # Если режим просмотра от конкретного пользователя, фильтруем список по пин-коду
    if eq_params.view_mode_key not in ["None", "boss", "unfinished"]:
        assignments = assignments.filter(
            executor__pin_code=eq_params.pin_code,
        ).distinct()

    # Фильтруем все списки по дате кроме режима недоделок
    if not eq_params.view_mode_key == "unfinished":
        week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()
        assignments = assignments.filter(
            date_completion__gt=week_info.date_range[0],
            date_completion__lte=week_info.date_range[1],
        ).distinct()

    return assignments


def get_eq_card_assignments(eq_params: RequestParams, target_list: str, order_product: OrderProduct):
    # Делаем проверку на режим просмотра от вида другого пользователя
    if eq_params.view_mode_key not in ['boss', 'unfinished', 'None']:
        eq_params.pin_code = Employee.objects.get(id=eq_params.view_mode_key).pin_code

    # Фильтруем наряды по отделу
    assignments = order_product.assignments.filter(
        department__number=eq_params.department_number
    ).distinct()

    match target_list:
        case 'await':
            assignments = get_await_assignments(assignments)[:50]
        case 'in_work':
            assignments = get_in_work_assignments(assignments, eq_params)[:50]

        case 'ready':
            assignments = get_ready_assignments(assignments, eq_params).order_by('-inspector')[:50]

        case 'mobile':
            await_assignments = get_await_assignments(assignments).order_by('number')[:50]
            in_work_assignments = get_in_work_assignments(assignments, eq_params).order_by('number')[:50]
            ready_assignments = get_ready_assignments(assignments, eq_params).order_by('-inspector')[:50]

            assignments = await_assignments.union(
                in_work_assignments, ready_assignments
            ).order_by('-inspector', 'number')

    # TODO добавить возможность возвращать больший размер списка
    return AssignmentExtendedSerializer(assignments, many=True).data
