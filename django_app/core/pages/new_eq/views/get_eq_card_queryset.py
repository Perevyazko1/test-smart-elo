from core.models import Assignment
from core.pages.new_eq.services.get_eq_req_params import get_eq_req_params
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee


def get_filtered_await_queryset(queryset, eq_params):
    # Фильтр при включенном режима бригадира
    if eq_params.view_mode_key == 'boss':
        # Извлекаем все не закрытые серии производства
        queryset = queryset.filter(
            status="0",
            assignments__status__in=['await', 'in_work'],
            assignments__department=eq_params.department
        ).distinct()

        # Если запрос не от конструкторов - фильтруем по наличию отдела в схеме производства
        if not eq_params.department.number == 1:
            queryset = queryset.filter(
                product__technological_process__schema__icontains=eq_params.department.name,
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
                department=eq_params.department,
                status='ready'
            ).count()

            if (eq_params.department.single and assignments_count) or (order_product.quantity == assignments_count):
                queryset = queryset.exclude(series_id=order_product.series_id)

    # Фильтр при включенном режима недоделки
    elif eq_params.view_mode_key == 'unfinished':
        queryset = queryset.filter(status="0").distinct()

        # Извлекаем все не закрытые серии производства
        if not eq_params.department.number == 1:
            queryset = queryset.filter(
                product__technological_process__schema__icontains=eq_params.department.name,
            ).distinct()

        # Оставляем изделия которые уже отработаны отделом
        for order_product in queryset:
            assignments_count = Assignment.objects.filter(
                order_product=order_product,
                department=eq_params.department,
                status='ready',
                inspector__isnull=False,
            ).count()
            if eq_params.department.single:
                if not assignments_count:
                    queryset = queryset.exclude(series_id=order_product.series_id)
            elif not order_product.quantity == assignments_count:
                queryset = queryset.exclude(series_id=order_product.series_id)
    else:
        queryset = queryset.filter(
            assignments__status__in=['await', 'in_work'],
            assignments__department=eq_params.department
        ).distinct()
    return queryset.order_by('urgency', 'order', 'id')


def get_filtered_in_work_queryset(queryset, eq_params):
    # Если получаем ключ - делаем подмену пин-кода для дальнейшей фильтрации
    if eq_params.view_mode_key not in ['boss', 'unfinished', 'self'] and eq_params.view_mode_key is not None:
        eq_params.user = Employee.objects.get(id=eq_params.view_mode_key)

    # Отфильтровываем персонально в случае режима просмотра в персональных режимах
    if eq_params.view_mode_key not in ['boss', 'unfinished']:
        queryset = queryset.filter(
            assignments__executor=eq_params.user,
            assignments__department=eq_params.department,
            assignments__status='in_work',
        ).distinct()

    # В режиме бригадира и недоделок получаем все изделия отдела в статусе в работе
    if eq_params.view_mode_key in ["boss", "unfinished"]:
        queryset = queryset.filter(
            assignments__department=eq_params.department,
            assignments__status='in_work',
        ).distinct()

    return queryset.order_by('urgency', 'order', 'id')


def get_filtered_ready_queryset(queryset, eq_params):
    # Делаем проверку на режим просмотра под пользователем
    # Если таков задан - переопределяем пин-код
    if eq_params.view_mode_key not in ['boss', 'unfinished', 'self'] and eq_params.view_mode_key is not None:
        eq_params.user = Employee.objects.get(id=eq_params.view_mode_key)

    # Отфильтровываем персонально в случае режима просмотра в персональных режимах
    if eq_params.view_mode_key is None or eq_params.view_mode_key not in ['boss', 'unfinished']:
        week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

        queryset = queryset.filter(
            assignments__executor=eq_params.user,
            assignments__department=eq_params.department,
            assignments__status='ready',
            assignments__date_completion__gt=week_info.date_range[0],
            assignments__date_completion__lte=week_info.date_range[1],
        ).distinct().order_by('-assignments__inspector')

    # В режиме бригадира фильтрацию по пин-коду не делаем
    if eq_params.view_mode_key == 'boss':
        week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

        queryset = queryset.filter(
            assignments__department=eq_params.department,
            assignments__status='ready',
            assignments__date_completion__gt=week_info.date_range[0],
            assignments__date_completion__lte=week_info.date_range[1],
        ).distinct().order_by('-assignments__inspector')

    # В режиме недоделок не фильтруем по пин-коду и по дате
    if eq_params.view_mode_key == 'unfinished':
        queryset = queryset.filter(
            assignments__department=eq_params.department,
            assignments__status='ready',
            assignments__inspector__isnull=True
        ).distinct()

    return queryset.order_by('urgency', 'order', 'id')


def get_eq_card_queryset(queryset, request):
    """Фильтр кверисета для запроса карточек"""
    # Извлекаем базовые параметры из запроса
    eq_params = get_eq_req_params(request)
    target_list = request.query_params.get('target_list')

    # Делаем общую фильтрацию по проекту
    if eq_params.project_filter is not None:
        queryset = queryset.filter(order__project=eq_params.project_filter).distinct()

    # Индивидуально прогоняем каждый сценарий запроса
    match target_list:
        case "await":
            return get_filtered_await_queryset(queryset, eq_params)

        case "in_work":
            return get_filtered_in_work_queryset(queryset, eq_params)

        case "ready":
            return get_filtered_ready_queryset(queryset, eq_params)

        case _:
            # TODO добавить логи ошибок
            print('НЕ КОРРЕКТНЫЙ TARGET LIST!!!')
            return None
