"""Initial methods and scripts."""
from datetime import timedelta

from salary.models import PayrollRow

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # date_to = "2025-07-20"
    # target_earnings = Earning.objects.filter(
    #     target_date__lte=date_to,
    # )

    all_rows = PayrollRow.objects.all()

    for row in all_rows:
        row.cash_payout = row.cash_payout * 100
        row.save()

    # for earning in target_earnings:
        # earning.cash_date = earning.target_date + timedelta(days=7)
        # earning.save()

    print('PASS')
    return f"Oki"
