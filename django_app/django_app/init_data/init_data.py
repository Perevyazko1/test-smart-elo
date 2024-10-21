"""Initial methods and scripts. """
from django.utils import timezone
import datetime

from staff.models import Transaction


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # Получаем текущую дату
    today = timezone.now()

    # Вычисляем дату 30 дней назад
    date_30_days_ago = today - datetime.timedelta(days=45)

    # Получаем транзакции, у которых add_date в пределах последних 30 дней и target_date не установлена
    transactions = Transaction.objects.filter(add_date__gte=date_30_days_ago, target_date__isnull=True)

    # Обновляем target_date
    for transaction in transactions:
        transaction.target_date = transaction.add_date
        transaction.save()

    print(f"Обновлено {transactions.count()} транзакций")
