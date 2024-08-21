"""Initial methods and scripts. """

from core.models import Assignment, AssignmentCoExecutor
from staff.models import Employee


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    velikiy = Employee.objects.get(
        username="Vilikiy_D"
    )

    Assignment.objects.filter(
        inspector__isnull=True,
        inspect_date__isnull=False,
    ).update(
        inspector=velikiy
    )

    Assignment.objects.filter(
        executor__isnull=True,
        appointment_date__isnull=False,
    ).update(
        executor=velikiy
    )
