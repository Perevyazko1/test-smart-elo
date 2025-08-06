from datetime import datetime

from django.db.models import Sum

from salary.models import Earning
from salary.serializers import EarningSerializer


def get_cash_info(date_from: datetime, date_to: datetime):
    target_earnings = Earning.objects.filter(
        cash_date__date__gte=date_from.date(),
        cash_date__date__lte=date_to.date(),
        earning_type__in=["Выдача НАЛ", "Внесение НАЛ"],
    )

    start_balance = Earning.objects.filter(
        earning_type__in=["Выдача НАЛ", "Внесение НАЛ"],
        cash_date__date__lt=date_from.date(),
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
