"""Initial methods and scripts. """
from datetime import datetime, timedelta

from core.models import Assignment
from staff.models import Department


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # TODO скрипт за последний месяц пересчитать наряды по сдельщикам которые были на окладе
    today = datetime.now()
    target_month = today - timedelta(days=30)
    target_departments = Department.objects.filter(
        piecework_wages=False
    )

    for department in target_departments:
        target_assignments = Assignment.objects.filter(
            department=department,
            inspector__isnull=False,
            tariffication_date__isnull=True
        )
        print(target_departments.count())
        for assignment in target_assignments:
            assignment.tariffication_date = assignment.inspect_date
            assignment.save()

    return target_month
