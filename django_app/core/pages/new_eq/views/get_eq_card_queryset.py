from core.models import Assignment
from core.pages.new_eq.services.get_eq_req_params import get_eq_req_params
from core.pages.new_eq.views.get_target_list_name_from_req import get_target_list_name_from_req
from core.services.get_week_info import GetWeekInfo
from staff.models import Department


def get_eq_card_queryset(queryset, request):
    """Фильтр кверисета для запроса карточек"""
    # Извлекаем базовые параметры из запроса
    eq_params = get_eq_req_params(request)
    target_list = get_target_list_name_from_req(request)

    # Делаем общую фильтрацию по проекту
    if not eq_params.project_filter == 'Все проекты':
        queryset = queryset.filter(order__project=eq_params.project_filter).distinct()

    # Индивидуально прогоняем каждый сценарий запроса
    match target_list:
        case "await":
            # Фильтр на случай режима просмотра личных нарядов или нарядов конкретного сотрудника
            if eq_params.view_mode_key == "0" or len(eq_params.view_mode_key) == 6:
                queryset = queryset.filter(
                    assignments__status__in=['await', 'in_work'],
                    assignments__department__number=eq_params.department_number
                ).distinct()

            # Фильтр при включенном режима бригадира
            if eq_params.view_mode_key == '1':
                # Извлекаем все не закрытые серии производства
                queryset = queryset.filter(status="0").distinct()
                department = Department.objects.get(number=eq_params.department_number)

                # Если запрос не от конструкторов - фильтруем по наличию отдела в схеме производства
                if not eq_params.department_number == '1':
                    queryset = queryset.filter(
                        product__technological_process__schema__icontains=department.name,
                    ).distinct()
                # Для конструкторов фильтруем по отсутствию подтвержденного технологического процесса
                else:
                    queryset = queryset.filter(
                        product__technological_process_confirmed__isnull=True
                    ).distinct()

                # Отфильтровываем изделия которые уже отработаны отделом
                for order_product in queryset:
                    assignments_count = Assignment.objects.filter(
                        order_product=order_product,
                        department=department,
                        status='ready'
                    ).count()

                    if (department.single and assignments_count) or (order_product.quantity == assignments_count):
                        queryset = queryset.exclude(series_id=order_product.series_id)

            # Фильтр при включенном режима недоделки
            if eq_params.view_mode_key == '2':
                queryset = queryset.filter(status="0").distinct()
                department = Department.objects.get(number=eq_params.department_number)

                # Извлекаем все не закрытые серии производства
                if not eq_params.department_number == '1':
                    queryset = queryset.filter(
                        product__technological_process__schema__icontains=department.name,
                    ).distinct()

                # Оставляем изделия которые уже отработаны отделом
                for order_product in queryset:
                    assignments_count = Assignment.objects.filter(
                        order_product=order_product,
                        department=department,
                        status='ready'
                    ).count()
                    if not ((department.single and assignments_count) or (order_product.quantity == assignments_count)):
                        queryset = queryset.exclude(series_id=order_product.series_id)
            return queryset.order_by('urgency', 'order__number', 'id')

        case "in_work":
            # Делаем проверку на режим просмотра под пользователем
            # Если таков задан - переопределяем пин-код
            if len(eq_params.view_mode_key) == 6:
                eq_params.pin_code = eq_params.view_mode_key

            # Отфильтровываем персонально в случае режима просмотра в персональных режимах
            if len(eq_params.view_mode_key) == 6 or eq_params.view_mode_key == "0":
                queryset = queryset.filter(
                    assignments__executor__pin_code=eq_params.pin_code,
                    assignments__department__number=eq_params.department_number,
                    assignments__status='in_work',
                ).distinct()

            # В режиме бригадира и недоделок получаем все изделия отдела в статусе в работе
            if eq_params.view_mode_key in ["1", "2"]:
                queryset = queryset.filter(
                    assignments__department__number=eq_params.department_number,
                    assignments__status='in_work',
                ).distinct()

            return queryset.order_by('urgency', 'order__number', 'id')

        case "ready":
            # Делаем проверку на режим просмотра под пользователем
            # Если таков задан - переопределяем пин-код

            if len(eq_params.view_mode_key) == 6:
                eq_params.pin_code = eq_params.view_mode_key

            # Отфильтровываем персонально в случае режима просмотра в персональных режимах
            if len(eq_params.view_mode_key) == 6 or eq_params.view_mode_key == "0":
                week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

                queryset = queryset.filter(
                    assignments__executor__pin_code=eq_params.pin_code,
                    assignments__department__number=eq_params.department_number,
                    assignments__status='ready',
                    assignments__date_completion__gt=week_info.date_range[0],
                    assignments__date_completion__lte=week_info.date_range[1],
                ).distinct().order_by('-assignments__inspector')

            # В режиме бригадира фильтрацию по пин-коду не делаем
            if eq_params.view_mode_key == '1':
                week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

                queryset = queryset.filter(
                    assignments__department__number=eq_params.department_number,
                    assignments__status='ready',
                    assignments__date_completion__gt=week_info.date_range[0],
                    assignments__date_completion__lte=week_info.date_range[1],
                ).distinct().order_by('-assignments__inspector')

            # В режиме недоделок не фильтруем по пин-коду и по дате
            if eq_params.view_mode_key == '2':
                queryset = queryset.filter(
                    assignments__department__number=eq_params.department_number,
                    assignments__status='ready',
                    assignments__inspector__isnull=True
                ).distinct()

            return queryset.order_by('urgency', 'order__number', 'id')
        case _:
            # TODO добавить логи ошибок
            print('НЕ КОРРЕКТНЫЙ TARGET LIST!!!')
            return None
