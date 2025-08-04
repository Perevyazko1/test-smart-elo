"""Initial methods and scripts."""
from datetime import timedelta

from salary.models import Earning

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    date_to = "2025-08-01"
    target_earnings = Earning.objects.filter(
        target_date__gte=date_to,
        earning_type="ЭЛО",
    )

    for earning in target_earnings:
        earning.amount = earning.amount * 100
        earning.save()

    print('PASS')
    return f"Oki"
