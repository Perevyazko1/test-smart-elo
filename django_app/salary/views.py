from datetime import datetime, timedelta

from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Earning, PayrollRow, Payroll
from .serializers import EarningSerializer, PayrollRowSerializer, PayrollSerializer
from .service.create_payroll import create_payroll
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

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def close_payroll_row(request):
    payroll_row_id = request.data.get('payroll_row_id')

    try:
        payroll_row_id = int(payroll_row_id)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid payroll_row_id format. Must be integer'},
        )

    payroll_row = PayrollRow.objects.get(id=payroll_row_id)

    if payroll_row.start_balance is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    next_payroll = Payroll.objects.filter(
        date_from=payroll_row.payroll.date_to + timedelta(days=1),
    )

    if next_payroll.exists():
        next_payroll_row = PayrollRow.objects.filter(
            user=payroll_row.user,
            payroll=next_payroll.first(),
        )

        if next_payroll_row.exists():
            next_payroll_row = next_payroll_row.first()
            new_sum = Earning.objects.filter(
                user=payroll_row.user,
                target_date__gte=payroll_row.payroll.date_from,
                target_date__lte=payroll_row.payroll.date_to,
                approval_by__isnull=False,
            ).aggregate(total=models.Sum('amount'))['total'] or 0

            next_payroll_row.start_balance = new_sum + payroll_row.start_balance
            next_payroll_row.save()

    payroll_row.is_closed = True
    payroll_row.save()
    payroll_row.refresh_from_db()

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
        return PayrollRow.objects.select_related(
            'payroll',
            'user',
            'user__permanent_department'
        ).prefetch_related(
            'user__earnings'
        )


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    lookup_field = 'date_from'


@api_view(['GET'])
def user_info(request):
    try:
        user_id = int(request.query_params.get('user_id'))
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid user_id format. Must be integer'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        date_from = datetime.strptime(request.query_params.get('date_from'), '%Y-%m-%d').date()
        date_to = datetime.strptime(request.query_params.get('date_to'), '%Y-%m-%d').date()
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
