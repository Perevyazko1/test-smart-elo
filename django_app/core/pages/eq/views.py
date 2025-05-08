"""Views for EQ Page. """
from dataclasses import asdict
from datetime import datetime, timedelta
import re

from django.db.models import Sum
from django.http import JsonResponse, Http404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import (
    OrderProduct, Assignment, ProductionStep, AssignmentCoExecutor, OrderProductComment)
from src.label_printer.main_label_template import main_label_template
from src.label_printer.printer import Printer
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
from ...signals import update_assignments_and_clean_cache, clean_all_eq_card_info_cache
from ...views import actualized_assembled


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
    view_modes = get_view_modes(eq_params['department'], request.user)

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

    if eq_params['view_mode_key'] == 'boss':
        assignments_sum = Assignment.objects.filter(
            department=eq_params['department'],
            tariffication_date__date__gte=week_info.date_range[0],
            tariffication_date__date__lte=week_info.date_range[1],
        ).aggregate(Sum('new_tariff__amount')).get('new_tariff__amount__sum')

        transactions_sum = 0
    else:
        if eq_params['user'].piecework_wages:
            auto_accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                created_automatically=True,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            auto_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                created_automatically=True,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                created_automatically=False,
                details__in=['prize', 'other', 'wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
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
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                details__in=['wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            wages_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                details__in=['wages'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            additional_accrual = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="accrual",
                inspector__isnull=False,
                details__in=['prize', 'other'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            additional_debit = Transaction.objects.filter(
                employee=eq_params['user'],
                target_date__date__gte=week_info.date_range[0],
                target_date__date__lte=week_info.date_range[1],
                transaction_type="debiting",
                inspector__isnull=False,
                created_automatically=False,
                details__in=['prize', 'other'],
            ).aggregate(Sum('amount')).get('amount__sum') or 0

            assignments_sum = wages_accrual - wages_debit
            transactions_sum = additional_accrual - additional_debit

    week_info.earned = f'{int(assignments_sum or 0)}'
    if transactions_sum:
        week_info.earned += f'{"+" if (transactions_sum or 0) >= 0 else ""}{int(transactions_sum or 0)}(доп)'

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
    op = OrderProduct.objects.get(series_id=series_id)
    user = request.user
    department = Department.objects.get(id=request.data.get('department__id'))

    if mode == 'remove_visa':
        if not is_user_in_group(user, 'Снятие визы'):
            return JsonResponse({
                f'error': f'Ошибка доступа. У пользователя нет прав на снятие визы с нарядов.'
            }, status=403, json_dumps_params={"ensure_ascii": False})

        for assignment_id in ids:
            assignment = Assignment.objects.get(id=assignment_id)

            # Проверка, действительно ли есть виза бригадира на переданном наряде
            if assignment.inspector is None:
                return JsonResponse({
                    f'error': f'Ошибка. Наряд №{assignment.number} '
                              f'серии {assignment.order_product.series_id} не содержит визы бригадира. '
                }, status=400, json_dumps_params={"ensure_ascii": False})

            # В случае если отменяемый наряд конструкторского отдела дополнительно снимаем техпроцесс
            if assignment.department.number == 1:
                op.product.technological_process_confirmed = None
                op.product.save()

            assignment.inspector = None
            assignment.inspect_date = None
            assignment.tariffication_date = None
            assignment.save()

            if assignment.new_tariff:
                if assignment.new_tariff.amount:
                    description = f'Отмена производства полуфабриката {assignment} {assignment.department.name}'
                    co_executors = AssignmentCoExecutor.objects.filter(
                        assignment=assignment
                    )
                    for co_executor in co_executors:
                        if co_executor.wages_amount:
                            Transaction.objects.create(
                                target_date=datetime.now(),
                                transaction_type='debiting',
                                details='wages',
                                amount=co_executor.wages_amount,
                                employee=co_executor.co_executor,
                                executor=user,
                                inspector=user,
                                description=description,
                            )

                    if assignment.amount:
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

        actualized_assembled(op)

    elif mode == 'lock_await_assignments':
        target_assignments = Assignment.objects.filter(
            order_product=op,
            department=department,
            status="await"
        )
        locked_status = target_assignments.filter(
            appointed_by_boss=True
        ).exists()

        update_assignments_and_clean_cache(
            target_assignments,
            op.id,
            department.id,
            appointed_by_boss=not locked_status,
        )

    else:
        if date == '':
            date = None

        qs = Assignment.objects.filter(
            department=department,
            order_product=op,
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

    clean_all_eq_card_info_cache(
        order_product__id=op.id,
        department__id=department.id,
    )

    notification_data = {str(department.number): {
        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
        'data': op.id,
    }}

    ws_group_updates(
        pin_code='',
        notification_data=notification_data
    )

    return JsonResponse({
        "result": 'ok'}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def update_timing_info(request):
    ps_id = request.data.get('ps_id')
    timing = request.data.get('timing')

    ps = ProductionStep.objects.get(
        id=ps_id
    )
    ps.scheduled_time=timing
    ps.save()

    order_products = OrderProduct.objects.filter(
        product=ps.product,
        status="0"
    )

    for op in order_products:
        clean_all_eq_card_info_cache(
            order_product__id=op.id,
            department__id=ps.department.id,
        )
        notification_data = {str(ps.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': op.id,
        }}
        ws_group_updates(
            pin_code='',
            notification_data=notification_data
        )

    return JsonResponse({'result': 'ok'}, json_dumps_params={"ensure_ascii": False})


@api_view(['get'])
def get_plan_info(request):
    days_count = request.query_params.get('days_count', '7')

    print(days_count)

    try:
        days_count = int(days_count)
    except ValueError:
        return JsonResponse({'error': 'days_count must be an integer'}, status=400)

    start_date = datetime.now().date()
    end_date = start_date + timedelta(days=days_count)

    days_load = {}

    assignments = Assignment.objects.filter(
        plane_date__date__gte=start_date,
        plane_date__date__lte=end_date,
        department=request.user.current_department,
    )
    print(assignments.count(), start_date, end_date)

    for assignment in assignments:
        day = assignment.plane_date.date().strftime('%Y-%m-%d')
        product = assignment.order_product.product
        production_step = ProductionStep.objects.get(
            product=product,
            department=assignment.department,
        )
        if day in days_load.keys():
            days_load[day] += production_step.scheduled_time
        else:
            days_load[day] = production_step.scheduled_time

    total_units_day = Employee.objects.filter(
        permanent_department=request.user.current_department,
        is_active=True,
    ).count() * 8 * 60

    result = {
        "total_units_day": total_units_day,
        "days_load": days_load
    }
    return JsonResponse({'data': result}, json_dumps_params={"ensure_ascii": False})



@api_view(['get'])
def print_labels(request):
    assignment_ids = request.query_params.get('assignment_ids').split(',')
    if not assignment_ids:
        return JsonResponse({'error': 'assignment_ids must be a list of integers'}, status=400)
    user = request.user.get_initials()

    for assignment_id in assignment_ids:
        target_assignment = Assignment.objects.get(id=assignment_id)
        project = target_assignment.order_product.order.project
        order_number = target_assignment.order_product.order.number
        position_number = target_assignment.order_product.series_id.split('-')[0]
        product_name = re.sub(r'[^\w\s\-\(\)\[\]\{\}№#@&\.,]', '', target_assignment.order_product.product.name)
        t1 = re.sub(r'[^\w\s\-\(\)\[\]\{\}№#@&\.,]', '',
                    target_assignment.order_product.main_fabric.name) if target_assignment.order_product.main_fabric else ""
        t2 = re.sub(r'[^\w\s\-\(\)\[\]\{\}№#@&\.,]', '',
                    target_assignment.order_product.second_fabric.name) if target_assignment.order_product.second_fabric else ""
        t3 = re.sub(r'[^\w\s\-\(\)\[\]\{\}№#@&\.,]', '',
                    target_assignment.order_product.third_fabric.name) if target_assignment.order_product.third_fabric else ""

        op_comments = OrderProductComment.objects.filter(
            order_product=target_assignment.order_product
        ).exclude(
            deleted=True
        ).order_by('-important', '-add_date')

        comments = []
        for comment in op_comments:
            comments.append(re.sub(r'[^\w\s\-\(\)\[\]\{\}№#@&\.,]', '', comment.text))

        department_name = target_assignment.department.name
        inner_number = target_assignment.order_product.order.inner_number

        print_date = datetime.now().strftime('%d.%m %H:%M:%S')

        main_text = [
            (project, 14 if len(project) < 15 else 11),
            ("---------", 8),
            (product_name, 9),
        ]

        if t1:
            main_text.append((f'Т1: {t1}', 7))
        if t2:
            main_text.append((f'Т2: {t2}', 7))
        if t3:
            main_text.append((f'Т3: {t3}', 7))

        main_text.extend([
            *(("К: " + comment, 8) for comment in comments),
            ("---------", 8),
        ])

        printer = Printer()
        qr_text = f"elo.szmk.pro/assignments/{target_assignment.id}"
        order_text = [
            (order_number, 14),
            ('---------', 8),
            (f'{position_number} ПОЗ', 11),
            ('---------', 8),
            (f'№ {target_assignment.number}', 11),
            (f'{print_date}{user}', 5),
        ]
        department_text = [
            (f"{department_name}: {inner_number}", 10),
        ]

        label = main_label_template(
            main_text,
            qr_text,
            order_text,
            department_text
        )
        printer.print_label(label)
    
    
    return JsonResponse({'data': 'ok'}, json_dumps_params={"ensure_ascii": False})