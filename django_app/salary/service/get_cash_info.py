from datetime import date

from django.db.models import Sum

from salary.models import Earning
from salary.serializers import EarningSerializer


def get_cash_info(date_from: date, date_to: date):
    target_earnings = Earning.objects.filter(
        crated_at__gte=date_from,
        crated_at__lte=date_to,
        earning_type__in=["Выдача НАЛ", "Внесение НАЛ"],
    )

    start_balance = Earning.objects.filter(
        earning_type__in=["Выдача НАЛ", "Внесение НАЛ"],
        crated_at__lt=date_from,
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    balance = Earning.objects.filter(
        earning_type__in=["Выдача НАЛ", "Внесение НАЛ"],
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    result = {
        "cash_balance": balance,
        "date_from": date_from,
        "date_to": date_to,
        "card_balance": 0,
        "start_balance": start_balance,
        "end_balance": 0,
        "earnings": EarningSerializer(target_earnings, many=True).data
    }

    return result
