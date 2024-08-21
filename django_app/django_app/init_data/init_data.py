"""Initial methods and scripts. """
from datetime import datetime

from core.models import Assignment, ProductionStep
from staff.models import Employee
from tasks.models import Task


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    velikiy = Employee.objects.get(
        username="Vilikiy_D"
    )

    Assignment.objects.filter(
        status='ready',
        executor__isnull=True,
    ).update(
        executor=velikiy
    )

    Assignment.objects.filter(
        status='in_work',
        executor__isnull=True,
    ).update(
        executor=velikiy
    )

    date_limit = datetime(2024, 7, 31)

    Assignment.objects.filter(
        inspector__isnull=True,
        date_completion__lt=date_limit,
    ).update(
        inspector=velikiy
    )

    Task.objects.filter(
        appointed_by__isnull=False,
        executor__isnull=True,
    ).exclude(
        view_mode='2'
    ).update(
        executor=velikiy
    )

    target_ps = ProductionStep.objects.filter(
        proposed_tariff__isnull=True,
        confirmed_tariff__isnull=False,
    )

    for ps in target_ps:
        ps.proposed_tariff = ps.confirmed_tariff
        ps.save()
