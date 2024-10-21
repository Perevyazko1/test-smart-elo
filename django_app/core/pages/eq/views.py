"""Views for EQ Page. """
from dataclasses import asdict
from datetime import datetime

from django.db.models import Sum
from django.http import JsonResponse, Http404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import (
    OrderProduct, Assignment, ProductionStep, AssignmentCoExecutor,
)
from staff.models import Employee, Transaction, Department
from staff.service import is_user_in_group
from .serializers import EqOrderProductSerializer
from .service.eq_update_assignments_status import EqUpdateAssignmentsStatus
from .service.get_eq_card_queryset import get_eq_card_queryset
from .service.get_eq_req_params import get_eq_req_params
from .service.get_project_filter import get_project_filters
from .service.get_view_modes import get_view_modes
from ...consumers import EqNotificationActions, ws_group_updates
from ...services.get_week_info import GetWeekInfo
from ...signals import update_assignments_and_clean_cache


class EqCardsViewSet(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EqOrderProductSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['eq_params'] = get_eq_req_params(request=self.request)
        context['target_list'] = self.request.query_params.get("target_list")
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = get_eq_card_queryset(queryset=qs, request=self.request)
        return qs

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Http404:
            # Возвращаем пустой ответ со статусом 200
            return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def update_card(request):
    eq_params = get_eq_req_params(request=request)
    op_id: str = request.data.get('op_id')
    assignment_ids: list[int] = request.data.get('assignment_ids')
    action: str = request.data.get('action')

    EqUpdateAssignmentsStatus(
        op_id=op_id,
        department=eq_params['department'],
        assignment_ids=assignment_ids,
        action=action,
        employee=eq_params['user'],
        selected_user=eq_params['selected_user'],
        view_mode=eq_params['view_mode_key']
    ).execute()

    return JsonResponse({}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_eq_filters(request):
    eq_params = get_eq_req_params(request)
    project_mode = request.query_params.get('project_mode')

    project_filters = get_project_filters(project_mode)
    view_modes = get_view_modes(eq_params['department'])

    return JsonResponse({
        "view_modes": view_modes,
        "project_filters": project_filters,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_week_data(request):
    eq_params = get_eq_req_params(request=request)

    if str(eq_params['view_mode_key']).isdigit():
        eq_params['user'] = Employee.objects.get(id=eq_params['view_mode_key'])

    week_info = GetWeekInfo(week=eq_params['week'], year=eq_params['year']).execute()

    print(f'###PRINT get_week_data #l=>93:', week_info.date_range[0], week_info.date_range[1])

    if eq_params['view_mode_key'] == 'boss':
        assignments_sum = Assignment.objects.filter(
            department=eq_params['department'],
            inspect_date__gte=week_info.date_range[0],
            inspect_date__lte=week_info.date_range[1],
        ).aggregate(Sum('new_tariff__amount')).get('new_tariff__amount__sum')

        transactions_sum = 0
    else:
        if eq_params['user'].piecework_wages:
            auto_accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                created_automatically=True,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            auto_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                created_automatically=True,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                created_automatically=False,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                created_automatically=False,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            assignments_sum = auto_accrual - auto_debit
            transactions_sum = accrual - debit
        else:
            wages_accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                details__in=['wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            wages_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                details__in=['wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            additional_accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                details__in=['prize', 'other'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            additional_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__gte=week_info.date_range[0],
                target_date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                created_automatically=False,
                details__in=['prize', 'other'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            assignments_sum = wages_accrual - wages_debit
            transactions_sum = additional_accrual - additional_debit

    week_info.earned = f'{int(assignments_sum or 0)}'
    if transactions_sum:
        week_info.earned += f'+{int(transactions_sum or 0)}(доп)'

    return JsonResponse(asdict(week_info), json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_card(request):
    eq_params = get_eq_req_params(request=request)
    series_id: str = request.query_params.get('series_id')

    queryset = OrderProduct.objects.get(series_id=series_id)

    return JsonResponse({
        "await": EqOrderProductSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'await',
        }).data,
        "in_work": EqOrderProductSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'in_work',
        }).data,
        "ready": EqOrderProductSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'ready',
        }).data,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_assignments(request):
    ids = request.data.get('ids')
    mode = request.data.get('mode')
    date = request.data.get('date')
    series_id = request.data.get('series_id')
    user = request.user
    department = Department.objects.get(id=request.data.get('department__id'))

    if mode == 'remove_visa':
        if not is_user_in_group(user, 'Снятие визы'):
            return JsonResponse({
                f'error': f'Ошибка доступа. У пользователя нет прав на снятие визы с нарядов.'
            }, status=401, json_dumps_params={"ensure_ascii": False})

        order_product = OrderProduct.objects.get(series_id=series_id)
        for assignment_id in ids:
            assignment = Assignment.objects.get(id=assignment_id)

            # Проверка действительно ли есть виза бригадира на переданном наряде
            if assignment.inspector is None:
                return JsonResponse({
                    f'error': f'Ошибка. Наряд №{assignment.number} '
                              f'серии {assignment.order_product.series_id} не содержит визы бригадира. '
                }, status=400, json_dumps_params={"ensure_ascii": False})

            # Условно в Пошиве 10 нарядов с визой
            assignments_with_visa_in_original_dep_count = Assignment.objects.filter(
                department=assignment.department,
                inspector__isnull=False,
                order_product=order_product,
            ).count()

            # Получаем исходный этап производства (условно Пошив)
            base_ps = ProductionStep.objects.get(
                department=assignment.department,
                product=assignment.order_product.product,
            )

            # В случае если отменяемый наряд конструкторского отдела - отменяем комплектацию всех нарядов
            if base_ps.department.number == 1:
                other_assignments = Assignment.objects.filter(
                    order_product__series_id=series_id,
                ).exclude(id=assignment_id)

                # Если есть наряды не в ожидании - возвращаем ошибку
                if other_assignments.filter(executor__isnull=False).exists():
                    return JsonResponse({
                        f'error': f'Ошибка. В других отделах есть наряды в статусах "В работе" или "Готов". '
                                  f'Устраните несоответствие или обратитесь к администратору.'
                    }, status=400, json_dumps_params={"ensure_ascii": False})
                else:
                    update_assignments_and_clean_cache(
                        other_assignments,
                        order_product.id,
                        None,
                        assembled=False,
                    )
                    order_product.product.technological_process_confirmed = None
                    order_product.product.save()

            # Для остальных нарядов вычисляем количество нарядов к отмене и отменяем
            else:
                # Храним ID этапов которые уже были обработаны
                # вычисляем по каждому последующему отделу относительно исходного наряда
                # от каких отделов зависел данный отдел и сколько в них минимальное количество готовых нарядов
                processed_ps = []
                for original_next_ps in base_ps.next_step.all():
                    # Тут условно получили original_next_ps = [Обивка]
                    if original_next_ps.department.single:
                        continue
                    if original_next_ps.id not in processed_ps:
                        processed_ps.append(original_next_ps.id)

                        # Тут условно получили previous_ps = [Пошив, Малярка, Сборка]
                        previous_ps = ProductionStep.objects.filter(
                            next_step__exact=original_next_ps.id,
                        )

                        min_assign_with_visa_in_dependents_departments = order_product.quantity
                        for dependent_ps in previous_ps:
                            if dependent_ps.department.single:
                                continue
                            # Получаем количество нарядов с визой в этом отделе
                            assignments_with_visa = Assignment.objects.filter(
                                order_product=order_product,
                                inspector__isnull=False,
                                department=dependent_ps.department,
                            ).count()
                            if min_assign_with_visa_in_dependents_departments > assignments_with_visa:
                                min_assign_with_visa_in_dependents_departments = assignments_with_visa

                        """
                        Если количество нарядов с визой в отделах от которых зависит исходный отдел меньше
                        то мы просто снимаем проверяющего и дату проверки с наряда. Иначе нам нужно взять последний
                        номер наряда в исходном отделе и отметить его не укомплектованным. 
                        условно [Пошив 10, Сборка 20, Малярка 30]
                        """
                        # Если бы в пошиве было больше завизированных нарядов чем в других отделах -
                        # то просто сняли бы визу
                        if not (min_assign_with_visa_in_dependents_departments <
                                assignments_with_visa_in_original_dep_count):
                            # Иначе получаем количество нарядов с визой в Обивке в ожидании или в работе
                            target_assignments = Assignment.objects.filter(
                                order_product=assignment.order_product,
                                department=original_next_ps.department,
                                status__in=['await', 'in_work'],
                                assembled=True,
                            )
                            # Если таковы имеются - переводим их в статус неукомплектованных начиная с последнего
                            if target_assignments.exists():
                                target_assignment = target_assignments.latest('number')
                                target_assignment.assembled = False
                                target_assignment.save()

                            else:
                                # Иначе бросаем ошибку, что нужно наряды возвращать
                                return JsonResponse({
                                    f'error': f'Ошибка. \n'
                                              f'Для снятия визы наряды последующего отдела должны быть в статусе '
                                              f'Ожидает.'
                                }, status=400, json_dumps_params={"ensure_ascii": False})

            assignment.inspector = None
            assignment.inspect_date = None
            assignment.save()

            if assignment.new_tariff:
                if assignment.new_tariff.amount:
                    description = f'Отмена производства полуфабриката {assignment} {assignment.department.name}'
                    co_executors = AssignmentCoExecutor.objects.filter(
                        assignment=assignment
                    )
                    for co_executor in co_executors:
                        if co_executor.co_executor.piecework_wages:
                            Transaction.objects.create(
                                target_date=datetime.now(),
                                transaction_type='debiting',
                                details='wages',
                                amount=co_executor.amount,
                                employee=co_executor.co_executor,
                                executor=user,
                                inspector=user,
                                description=description,
                            )
                    if assignment.executor.piecework_wages:
                        Transaction.objects.create(
                            target_date=datetime.now(),
                            transaction_type='debiting',
                            details='wages',
                            amount=assignment.amount,
                            employee=assignment.executor,
                            executor=request.user,
                            inspector=request.user,
                            description=description,
                        )
    elif mode == 'lock_await_assignments':
        order_product = OrderProduct.objects.get(series_id=series_id)
        target_assignments = Assignment.objects.filter(
            order_product=order_product,
            department=department,
            status="await"
        )
        locked_status = target_assignments.filter(
            appointed_by_boss=True
        ).exists()
        print(f'###PRINT update_assignments #l=>319:', locked_status, not locked_status)
        update_assignments_and_clean_cache(
            target_assignments,
            order_product.id,
            department.id,
            appointed_by_boss=not locked_status,
        )

    else:
        if date == '':
            date = None

        qs = Assignment.objects.filter(
            department=department,
            order_product__series_id=series_id,
            status__in=['in_work', 'await']
        )

        if qs.exists():
            qs = qs.filter(id__in=ids)
            match mode:
                case 'selected':
                    for assignment in qs:
                        assignment.plane_date = date
                        assignment.save()
        else:
            return JsonResponse(
                {"result": 'ok'},
                json_dumps_params={"ensure_ascii": False}
            )

    notification_data = {str(department.number): {
        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
        'data': OrderProduct.objects.get(series_id=series_id).id,
    }}

    ws_group_updates(
        pin_code='',
        notification_data=notification_data
    )

    return JsonResponse({
        "result": 'ok'}, json_dumps_params={"ensure_ascii": False})
