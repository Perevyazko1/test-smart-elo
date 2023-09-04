from dataclasses import asdict

from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.services.get_week_info import GetWeekInfo
from staff.models import Employee, Transaction
from staff.pages.wages_pages.filters import EmployeeModelFilter, TransactionModelFilter
from staff.pages.wages_pages.serializers import WagesSerializer, TransactionSerializer
from staff.pages.wages_pages.services import get_weeks_list_info


class WagesViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = WagesSerializer
    filterset_class = EmployeeModelFilter

    def list(self, request, *args, **kwargs):
        week_info = get_weeks_list_info()
        total_data = {}

        total_balance = Employee.objects.all().aggregate(Sum('current_balance'))['current_balance__sum']
        total_data['Баланс'] = {
            'total': total_balance,
            'confirmed': False,
        }

        for week in week_info:
            transactions = Transaction.objects.filter(
                details='wages',
                add_date__gt=week.date_range[0],
                add_date__lte=week.date_range[1],
            )
            total_amount = transactions.aggregate(Sum('amount'))['amount__sum']
            has_uninspected = transactions.filter(inspector__isnull=True).exists()

            total_data[f'Нед. {week.week}'] = {
                'total': total_amount,
                'confirmed': not has_uninspected,
            }

        serializer = self.get_serializer(self.filter_queryset(self.get_queryset()), many=True)

        return Response({'detailed_data': serializer.data, 'total_data': total_data})


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filterset_class = TransactionModelFilter


@api_view(['GET'])
def get_wages_week_info(request):
    week = request.query_params.get('week')
    year = request.query_params.get('year')
    employee__id = request.query_params.get('employee__id')
    week_srt_days = [
        "ПН.",
        "ВТ.",
        "СР.",
        "ЧТ.",
        "ПТ.",
        "СБ.",
        "ВС.",
    ]
    earned_per_week = {}

    target_week_info = GetWeekInfo(week=week, year=year).execute()

    for i, week_day in enumerate(week_srt_days):
        transaction = Transaction.objects.filter(
            employee__id=employee__id,
            add_date__date=target_week_info.dt_dates[i],
        )
        accruals = transaction.filter(amount__gte=0).aggregate(Sum('amount'))['amount__sum'] or 0
        debit = transaction.filter(amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0

        earned_per_week[week_day] = {
            'accruals': accruals,
            'debit': debit,
        }

    return JsonResponse({
        'target_week_info': asdict(target_week_info),
        'earned_per_week': earned_per_week,
    }, json_dumps_params={"ensure_ascii": False})
