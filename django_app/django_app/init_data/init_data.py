"""Initial methods and scripts. """
from django.utils import timezone
import datetime
from django.db.models import Count


from staff.models import Transaction


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # Получаем текущую дату
    today = timezone.now()

    # Вычисляем дату 30 дней назад
    date_20_days_ago = today - datetime.timedelta(days=10)

    transactions = Transaction.objects.filter(
        add_date__gte=date_20_days_ago,
        description__startswith="Производство полуфабриката",
    )

    # Шаг 2: Группировка по описанию и подсчет количества дубликатов
    duplicate_transactions = (
        transactions
        .values('description')
        .annotate(count=Count('id'))
        .filter(count__gt=1)
    )

    # Шаг 3: Удаление всех дубликатов, кроме одной записи для каждого уникального описания
    for duplicate in duplicate_transactions:
        description = duplicate['description']
        transactions_to_delete = Transaction.objects.filter(description=description).order_by('id')[1:]

        # Удаляем дубликаты через их ID
        Transaction.objects.filter(id__in=transactions_to_delete.values_list('id', flat=True)).delete()

    print("Удаление дубликатов завершено.")

