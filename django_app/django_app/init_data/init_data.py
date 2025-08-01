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

    for earning in target_earnings:
        if earning.user:
            earning.cash_date = earning.target_date + timedelta(days=7)
        else:
            earning.cash_date = earning.target_date

        earning.save()

    print('PASS')
    return f"Oki"
