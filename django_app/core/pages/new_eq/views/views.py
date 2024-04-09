from dataclasses import asdict

from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.consumers import ws_group_updates, EqNotificationActions
from core.models import OrderProduct, Assignment, ProductionStep
from core.pages.new_eq.serializers.serializers import EqCardSerializer
from core.pages.new_eq.services.get_eq_req_params import get_eq_req_params
from core.pages.new_eq.views.get_eq_card_queryset import get_eq_card_queryset
from core.services.get_week_info import GetWeekInfo
from staff.models import Transaction, Department, Employee
from staff.service import is_user_in_group
from .get_project_filter import get_project_filters
from .get_view_modes import get_view_modes
from .update_assignments import UpdateAssignments


class GetEqCards(viewsets.ModelViewSet):
    queryset = OrderProduct.objects.all()
    serializer_class = EqCardSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['eq_params'] = get_eq_req_params(request=self.request)
        context['target_list'] = self.request.query_params.get("target_list")
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = get_eq_card_queryset(queryset=qs, request=self.request)
        return qs


@api_view(['POST'])
def update_card(request):
    eq_params = get_eq_req_params(request=request)
    series_id: str = request.data.get('series_id')
    numbers: list[int] = request.data.get('numbers')
    action: str = request.data.get('action')

    UpdateAssignments(series_id=series_id,
                      department=eq_params.department,
                      numbers=numbers,
                      action=action,
                      employee=eq_params.user,
                      view_mode=eq_params.view_mode_key
                      ).execute()

    queryset = OrderProduct.objects.get(series_id=series_id)

    return JsonResponse({
        "await": EqCardSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'await',
        }).data,
        "in_work": EqCardSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'in_work',
        }).data,
        "ready": EqCardSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'ready',
        }).data,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_eq_filters(request):
    eq_params = get_eq_req_params(request)
    mode = request.query_params.get('project_mode')

    project_filters = get_project_filters(mode)
    view_modes = get_view_modes(eq_params.department)

    return JsonResponse({
        "view_modes": view_modes,
        "project_filters": project_filters,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_week_data(request):
    eq_params = get_eq_req_params(request=request)

    if eq_params.view_mode_key not in ['self', 'boss', 'unfinished'] and eq_params.view_mode_key is not None:
        eq_params.user = Employee.objects.get(id=eq_params.view_mode_key)

    week_info = GetWeekInfo(week=eq_params.week, year=eq_params.year).execute()

    earned = Assignment.objects.filter(
        executor=eq_params.user,
        department=eq_params.department,
        inspector__isnull=False,
        date_completion__gte=week_info.date_range[0],
        date_completion__lt=week_info.date_range[1],
    ).aggregate(Sum('tariff__tariff')).get('tariff__tariff__sum')

    transactions_sum = Transaction.objects.filter(
        employee=eq_params.user,
        inspect_date__gte=week_info.date_range[0],
        inspect_date__lt=week_info.date_range[1],
        transaction_type="accrual",
        details__in=['prize', 'fine']
    ).aggregate(Sum('amount')).get('amount__sum')

    week_info.earned = f'{earned or "0"}'
    if transactions_sum:
        week_info.earned += f' + {int(transactions_sum)}(доп)'

    return JsonResponse(asdict(week_info), json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_card(request):
    eq_params = get_eq_req_params(request=request)
    series_id: str = request.query_params.get('series_id')

    queryset = OrderProduct.objects.get(series_id=series_id)

    return JsonResponse({
        "await": EqCardSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'await',
        }).data,
        "in_work": EqCardSerializer(queryset, context={
            'eq_params': eq_params,
            'target_list': 'in_work',
        }).data,
        "ready": EqCardSerializer(queryset, context={
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

            assignments_with_visa_in_original_dep_count = Assignment.objects.filter(
                department=assignment.department,
                inspector__isnull=False,
                order_product=order_product,
            ).count()
            # Получаем исходный этап производства
            base_ps = ProductionStep.objects.get(
                department=assignment.department,
                product=assignment.order_product.product,
            )

            # TODO сделать алгоритм для единичных не конструкторских отделов
            # В случае если отменяемый наряд конструкторского отдела - удаляем все остальные созданные наряды
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
                    other_assignments.delete()
                    order_product.product.technological_process_confirmed = None
                    order_product.product.save()
                    assignment.inspect_date = False
                    assignment.inspector = None
                    assignment.save()

            # Для остальных нарядов вычисляем количество нарядов к отмене и отменяем
            else:
                # Храним ID этапов которые уже были обработаны
                processed_ps = []
                for original_next_ps in base_ps.next_step.all():
                    if original_next_ps.department.single:
                        # TODO сделать обработку если следующий отдел единичный
                        continue
                    if original_next_ps.id not in processed_ps:
                        processed_ps.append(original_next_ps.id)

                        # Вычисляем по каждому последующему отделу относительно исходного наряда
                        # от каких отделов зависел данный отдел и сколько в них минимальное количество готовых нарядов
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
                        номер наряда в исходном отделе и перевести его в статус Созданного
                        """
                        if min_assign_with_visa_in_dependents_departments < assignments_with_visa_in_original_dep_count:
                            assignment.inspector = None
                            assignment.inspect_date = None
                            assignment.save()
                        else:
                            target_assignments = Assignment.objects.filter(
                                order_product=assignment.order_product,
                                department=original_next_ps.department,
                                status='await'
                            )
                            if target_assignments.count() == min_assign_with_visa_in_dependents_departments:
                                target_assignment = target_assignments.latest('number')
                                target_assignment.status = 'created'
                                target_assignment.save()

                                assignment.inspector = None
                                assignment.inspect_date = None
                                assignment.save()
                            else:
                                return JsonResponse({
                                    f'error': f'Ошибка. '
                                              f'Для снятия визы наряды последующего отдела должны быть в статусе '
                                              f'Ожидает.'
                                }, status=400, json_dumps_params={"ensure_ascii": False})

    else:
        if date == '':
            date = None

        qs = Assignment.objects.filter(
            department=department,
            order_product__series_id=series_id,
            status__in=['in_work', 'await']
        )

        if qs.exists():
            match mode:
                case 'in_work':
                    qs.filter(
                        status='in_work'
                    ).update(
                        plane_date=date
                    )
                case 'all':
                    qs.update(
                        plane_date=date
                    )
                case 'selected':
                    qs.filter(
                        id__in=ids
                    ).update(
                        plane_date=date
                    )
                case 'await':
                    qs.filter(
                        status='await'
                    ).update(
                        plane_date=date
                    )
        else:
            return JsonResponse({
                "result": 'ok'}, json_dumps_params={"ensure_ascii": False})
    notification_data = {str(department.number): {
        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
        'data': series_id,
    }}

    ws_group_updates(
        pin_code='',
        notification_data=notification_data
    )

    return JsonResponse({
        "result": 'ok'}, json_dumps_params={"ensure_ascii": False})
