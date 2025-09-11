"""Get filtered queryset for EQ request. """
from typing import Type

from django.db.models import Q, QuerySet

from core.models import Assignment, OrderProduct
from core.pages.eq.service.get_eq_req_params import get_eq_req_params
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee


def get_filtered_await_queryset(queryset, eq_params):
    # Фильтр при включенном режима бригадира
    if eq_params['view_mode_key'] == 'boss':
        if eq_params['department'].number == 1:
            filter_params = {
                "status": "0",
                "product__technological_process_confirmed__isnull": True,
            }
            if eq_params['locked']:
                filter_params['assignments__appointed_by_boss'] = False
                filter_params['assignments__department'] = eq_params['department']

            queryset = queryset.filter(
                **filter_params
            ).distinct()
        else:
            # Извлекаем все не закрытые серии производства
            filter_params = {
                "status": "0",
                "assignments__department": eq_params['department'],
                "assignments__status__in": ['await', 'in_work'],
            }

            if not eq_params['assembled']:
                filter_params['assignments__assembled'] = True

            if eq_params['locked']:
                del filter_params['assignments__status__in']
                queryset = queryset.filter(
                    **filter_params,
                    assignments__status='await',
                    assignments__appointed_by_boss=False,
                ).distinct()
            else:
                queryset = queryset.filter(
                    **filter_params
                ).distinct()

    # Фильтр при включенном режима недоделки
    elif eq_params['view_mode_key'] == 'unfinished':
        queryset = queryset.filter(status="0").distinct()

        # Извлекаем все не закрытые серии производства
        if not eq_params['department'].number == 1:
            queryset = queryset.filter(
                product__technological_process__schema__icontains=eq_params['department'].name,
            ).distinct()

        # Оставляем изделия которые уже отработаны отделом
        for order_product in queryset:
            assignments_count = Assignment.objects.filter(
                order_product=order_product,
                department=eq_params['department'],
                status='ready',
                inspector__isnull=False,
            ).count()
            if eq_params['department'].single:
                if not assignments_count:
                    queryset = queryset.exclude(id=order_product.id)
            elif not order_product.quantity == assignments_count:
                queryset = queryset.exclude(id=order_product.id)
    else:
        filter_params = {
            "status": "0",
            "assignments__department": eq_params['department'],
            "assignments__status": 'await',
            'assignments__appointed_by_boss': False
        }

        if not eq_params['assembled']:
            filter_params['assignments__assembled'] = True
            queryset = queryset.filter(
                **filter_params,
            ).distinct()
        else:
            queryset = queryset.filter(
                **filter_params
            ).distinct()

    return queryset.order_by('urgency', 'order', 'id').distinct()


def get_filtered_in_work_queryset(queryset: QuerySet[Type[OrderProduct]], eq_params):
    # Если получаем ключ цифру - делаем подмену пользователя для дальнейшей фильтрации
    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    # Отфильтровываем персонально в случае режима просмотра в персональных режимах
    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        queryset = queryset.filter(
            Q(
                assignments__executor=eq_params['user'],
                status="0",
                assignments__status='in_work',
                assignments__department=eq_params['department'],
            ) |
            Q(
                assignments__co_executors__co_executor=eq_params['user'],
                status="0",
                assignments__status='in_work',
                assignments__department=eq_params['department'],
            )
        ).distinct()

    # В режиме бригадира и недоделок получаем все изделия отдела в статусе в работе
    if eq_params['view_mode_key'] in ["boss", "unfinished"]:
        queryset = queryset.filter(
            status="0",
            assignments__department=eq_params['department'],
            assignments__status='in_work',
        ).distinct()

    return queryset.order_by('urgency', 'order', 'id')


def get_filtered_ready_queryset(queryset, eq_params):
    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    show_all = eq_params.get('show_all') and eq_params.get('project_filter')

    def get_base_filter(department, status='ready'):
        return {
            'assignments__department': department,
            'assignments__status': status
        }

    def get_date_filter(week_info):
        return {
            'assignments__tariffication_date__date__gte': week_info.date_range[0].date(),
            'assignments__tariffication_date__date__lte': week_info.date_range[1].date()
        }

    if eq_params['view_mode_key'] not in ['boss', 'unfinished']:
        current_week = GetWeekInfo(week=None, year=None).execute()
        week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()
        base_filters = get_base_filter(eq_params['department'])

        if current_week.week == week_info.week and current_week.year == week_info.year and not show_all:
            date_filters = get_date_filter(week_info)
            queryset = queryset.filter(
                Q(**date_filters, **base_filters, assignments__executor=eq_params['user']) |
                Q(**base_filters, assignments__executor=eq_params['user'],
                  assignments__tariffication_date__isnull=True) |
                Q(**date_filters, **base_filters, assignments__co_executors__co_executor=eq_params['user']) |
                Q(**base_filters, assignments__co_executors__co_executor=eq_params['user'],
                  assignments__tariffication_date__isnull=True)
            )
        elif not show_all:
            date_filters = get_date_filter(week_info)
            queryset = queryset.filter(
                Q(**date_filters, **base_filters, assignments__executor=eq_params['user']) |
                Q(**date_filters, **base_filters, assignments__co_executors__co_executor=eq_params['user'])
            )
        else:
            queryset = queryset.filter(
                Q(**base_filters, assignments__executor=eq_params['user']) |
                Q(**base_filters, assignments__co_executors__co_executor=eq_params['user'])
            )
        queryset = queryset.order_by('-assignments__inspector')

    elif eq_params['view_mode_key'] == 'boss':
        current_week = GetWeekInfo(week=None, year=None).execute()
        week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()
        base_filters = get_base_filter(eq_params['department'])

        if current_week.week == week_info.week and current_week.year == week_info.year and not show_all:
            date_filters = get_date_filter(week_info)
            queryset = queryset.filter(
                Q(**date_filters, **base_filters) |
                Q(**base_filters, assignments__tariffication_date__isnull=True)
            )
        elif not show_all:
            queryset = queryset.filter(**get_date_filter(week_info), **base_filters)
        else:
            queryset = queryset.filter(**base_filters)

    elif eq_params['view_mode_key'] == 'unfinished':
        queryset = queryset.filter(
            **get_base_filter(eq_params['department']),
            assignments__tariffication_date__isnull=True
        )

    return queryset.distinct().order_by('urgency', 'order', 'id')


def get_eq_card_queryset(queryset, request):
    """Фильтр кверисета для запроса карточек"""
    # Извлекаем базовые параметры из запроса
    eq_params = get_eq_req_params(request)
    target_list = request.query_params.get('target_list')

    # Предварительная загрузка связанных данных
    queryset = queryset.select_related(
        'product', 'order', 'main_fabric', 'second_fabric', 'third_fabric'
    ).prefetch_related(
        'assignments'
    )

    # Делаем общую фильтрацию по проекту
    if eq_params['project_filter'] is not None:
        queryset = queryset.filter(order__project=eq_params['project_filter']).distinct()

    # Если передан поиск - ищем по названию товара, внутреннему или внешнему номеру заказа
    if eq_params['search'] is not None:
        queryset = queryset.filter(
            Q(product__name__icontains=eq_params['search']) |
            Q(series_id__icontains=eq_params['search']) |
            Q(order__inner_number__icontains=eq_params['search'])
        ).distinct()

    # Индивидуально прогоняем каждый сценарий запроса
    match target_list:
        case "await":
            return get_filtered_await_queryset(queryset, eq_params)

        case "in_work":
            return get_filtered_in_work_queryset(queryset, eq_params)

        case "distribute":
            return get_filtered_in_work_queryset(queryset, eq_params)

        case "ready":
            return get_filtered_ready_queryset(queryset, eq_params)

        case _:
            print('НЕ КОРРЕКТНЫЙ TARGET LIST!!!')
            return None
