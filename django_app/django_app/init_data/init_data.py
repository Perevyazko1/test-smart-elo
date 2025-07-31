"""Initial methods and scripts."""
from datetime import timedelta

from salary.models import Earning

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    date_to = "2025-07-20"
    target_earnings = Earning.objects.filter(
        target_date__lte=date_to,
    )

    other_earnings = Earning.objects.filter(
        target_date__gt=date_to,
    )

    for earning in target_earnings:
        # earning.cash_date = earning.target_date + timedelta(days=7)
        earning.amount = earning.amount * 100
        earning.save()

    for earning in other_earnings:
        earning.amount = earning.amount * 100
        earning.save()

    print('PASS')
    return f"Oki"
