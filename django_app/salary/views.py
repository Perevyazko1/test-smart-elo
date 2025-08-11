from datetime import datetime

from django.db.models import DecimalField, Exists, OuterRef, Subquery, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Earning, PayrollRow, Payroll
from .serializers import EarningSerializer, PayrollRowSerializer, PayrollSerializer
from .service.close_payroll_row import payroll_row_close
from .service.create_payroll import create_payroll
from .service.get_cash_info import get_cash_info
from .service.get_user_info import get_user_info


@api_view(['POST'])
def create_new_payroll(request):
    req_date_from = request.data.get('date_from')

    try:
        date_from = datetime.strptime(req_date_from, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )

    create_payroll(date_from)
    return Response(status=status.HTTP_201_CREATED)


@api_view(['POST'])
def confirm_earnings(request):
    date_from = request.data.get('date_from')
    date_to = request.data.get('date_to')
    user_id = request.data.get('user_id')

    try:
        date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid user_id format. Must be integer'},
        )


    Earning.objects.filter(
        target_date__gte=date_from,
        target_date__lte=date_to,
        user=user_id,
        approval_by__isnull=True,
    ).update(approval_by=request.user)

    target_row = PayrollRow.objects.filter(
        user=user_id,
        payroll__date_from=date_from,
        payroll__date_to=date_to,
    )

    return Response(
        PayrollRowSerializer(target_row.first()).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def close_payroll_row(request):
    payroll_row_id = request.data.get('payroll_row_id')
    close = request.data.get('close')

    try:
        payroll_row_id = int(payroll_row_id)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid payroll_row_id format. Must be integer'},
        )

    try:
        close = bool(close)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid close format. Must be bool'},
        )

    payroll_row = payroll_row_close(payroll_row_id, close)

    return Response(status=status.HTTP_200_OK, data=PayrollRowSerializer(payroll_row).data)


class EarningViewSet(viewsets.ModelViewSet):
    queryset = Earning.objects.all()
    serializer_class = EarningSerializer


class PayrollRowViewSet(viewsets.ModelViewSet):
    queryset = PayrollRow.objects.all()
    serializer_class = PayrollRowSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payroll']

    def get_queryset(self):
        unconfirmed_earnings = Earning.objects.filter(
            user_id=OuterRef('user_id'),
            target_date__date__gte=OuterRef('payroll__date_from'),
            target_date__date__lte=OuterRef('payroll__date_to'),
            approval_by__isnull=True
        )

        hide_balance_rows = PayrollRow.objects.filter(
            user_id=OuterRef('user_id'),
            is_closed=False,
            payroll__date_to__lt=OuterRef('payroll__date_from')
        )

        def create_sum_subquery(queryset, earning_type=None):
            if earning_type:
                queryset = queryset.filter(earning_type=earning_type)
            return Subquery(
                queryset.values('user_id')
                .annotate(total=Sum('amount'))
                .values('total'),
                output_field=DecimalField()
            )

        earnings_in_period = Earning.objects.filter(
            user_id=OuterRef('user_id'),
            target_date__date__gte=OuterRef('payroll__date_from'),
            target_date__date__lte=OuterRef('payroll__date_to'),
            approval_by__isnull=False
        )

        balance_earnings = Earning.objects.filter(
            user_id=OuterRef('user_id'),
            target_date__date__lt=OuterRef('payroll__date_from'),
            approval_by__isnull=False
        ).exclude(earning_type='ЗАЙМ')

        all_time_earnings = Earning.objects.filter(user_id=OuterRef('user_id'))

        return PayrollRow.objects.select_related(
            'payroll',
            'user',
            'user__permanent_department'
        ).annotate(
            annotated_has_unconfirmed=Exists(unconfirmed_earnings),
            annotated_hide_balance=Exists(hide_balance_rows),
            annotated_tax_sum=create_sum_subquery(earnings_in_period, 'Налог'),
            annotated_card_sum=create_sum_subquery(earnings_in_period, 'На карту'),
            annotated_earned_sum=create_sum_subquery(earnings_in_period, 'ЭЛО'),
            annotated_bonus_sum=create_sum_subquery(earnings_in_period, 'ДОП'),
            annotated_issued_sum=create_sum_subquery(earnings_in_period, 'Выдача НАЛ'),
            annotated_ip_sum=create_sum_subquery(earnings_in_period, 'ИП'),
            annotated_loan_sum=create_sum_subquery(earnings_in_period, 'ПОГ.ЗАЙМА'),
            annotated_balance_sum=create_sum_subquery(balance_earnings),
            annotated_full_loan_sum=create_sum_subquery(all_time_earnings, 'ЗАЙМ'),
            annotated_end_loan_sum=create_sum_subquery(all_time_earnings, 'ПОГ.ЗАЙМА'),
        )


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    lookup_field = 'date_from'


@api_view(['GET'])
@permission_classes([AllowAny])
def user_info(request):
    try:
        user_id = int(request.query_params.get('user_id'))
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid user_id format. Must be integer'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        date_from = datetime.strptime(request.query_params.get('date_from'), '%Y-%m-%d')
        date_to = datetime.strptime(request.query_params.get('date_to'), '%Y-%m-%d')
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )

    info = get_user_info(
        user_id=user_id,
        date_from=date_from,
        date_to=date_to
    )

    return Response(info)


@api_view(['GET'])
def cash_info(request):
    try:
        date_from = datetime.strptime(request.query_params.get('date_from'), '%Y-%m-%d')
        date_to = datetime.strptime(request.query_params.get('date_to'), '%Y-%m-%d')
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )

    info = get_cash_info(
        date_from=date_from,
        date_to=date_to
    )

    return Response(info)
