"""Initial methods and scripts."""
from salary.models import Earning
from staff.models import Transaction


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    target_transactions = Transaction.objects.filter(
        target_date__gte="2025-07-07",
        target_date__lte="2025-07-20",
    )

    for transaction in target_transactions:
        earning_type = "ЭЛО"
        if transaction.details == 'prize':
            earning_type = "ДОП"

        amount = transaction.amount
        if transaction.transaction_type == 'debiting':
            amount = -amount

        Earning.objects.create(
            user=transaction.employee,
            target_date=transaction.target_date,
            amount=amount,
            earning_type=earning_type,
            created_by=transaction.executor,
            approval_by=transaction.inspector,
            comment=transaction.description,
        )

    print('PASS')
    return f"Oki"
