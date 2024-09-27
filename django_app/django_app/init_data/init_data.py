"""Initial methods and scripts. """
from core.models import Assignment


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_assignments = Assignment.objects.filter(
        new_tariff__isnull=False,
        inspector__isnull=False,
        inspect_date__isnull=False,
        tariffication_date__isnull=True,
    )

    for assignment in target_assignments:
        assignment.tariffication_date = assignment.inspect_date
        assignment.save()
