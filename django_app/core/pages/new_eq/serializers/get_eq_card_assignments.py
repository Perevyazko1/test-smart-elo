from core.models import OrderProduct
from core.pages.new_eq.services.get_eq_req_params import RequestParams
from core.serializers import AssignmentsSerializer
from core.services.get_week_info import GetWeekInfo


def get_eq_card_assignments(eq_params: RequestParams, target_list: str, order_product: OrderProduct):
    # Делаем проверку на режим просмотра от вида другого пользователя
    if len(eq_params.view_mode_key) == 6:
        eq_params.pin_code = eq_params.view_mode_key

    # Фильтруем наряды по отделу
    assignments = order_product.assignments.filter(
        department__number=eq_params.department_number
    ).distinct()

    match target_list:
        case 'await':
            assignments = assignments.filter(
                status="await",
            ).distinct()
        case 'in_work':
            assignments = assignments.filter(
                status="in_work",
            ).distinct()

            # Если режим просмотра от конкретного пользователя, фильтруем список по пин-коду
            if eq_params.view_mode_key not in ["1", "2"]:
                assignments = assignments.filter(
                    executor__pin_code=eq_params.pin_code,
                )

        case 'ready':
            assignments = assignments.filter(
                status="ready",
            ).distinct()

            # Если режим просмотра от конкретного пользователя, фильтруем список по пин-коду
            if eq_params.view_mode_key not in ["1", "2"]:
                assignments = assignments.filter(
                    executor__pin_code=eq_params.pin_code,
                ).distinct()

            # Фильтруем все списки по дате кроме режима недоделок
            if not eq_params.view_mode_key == "2":
                week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()
                assignments = assignments.filter(
                    date_completion__gt=week_info.date_range[0],
                    date_completion__lte=week_info.date_range[1],
                ).distinct()
    # TODO добавить возможность возвращать больший размер списка
    return AssignmentsSerializer(assignments.order_by('-inspector')[:50], many=True).data
