"""Initial methods and scripts. """
from django.utils import timezone
import datetime

from core.models import Assignment


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # Получаем текущую дату
    today = timezone.now()

    # Вычисляем дату 30 дней назад
    date_30_days_ago = today - datetime.timedelta(days=45)

    # Получаем транзакции, у которых add_date в пределах последних 30 дней и target_date не установлена
    assignments = Assignment.objects.filter(
        inspect_date__lte=date_30_days_ago,
        inspector__isnull=False,
        tariffication_date__isnull=True
    )

    # Обновляем target_date
    for assignment in assignments:
        if not assignment.inspect_date:
            assignment.inspect_date = assignment.date_completion
            assignment.tariffication_date = assignment.date_completion
        else:
            assignment.tariffication_date = assignment.inspect_date
        assignment.save()

    print(f"Обновлено {assignments.count()} наряда")
