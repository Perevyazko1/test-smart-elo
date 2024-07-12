"""Initial methods and scripts. """
from core.models import ProductionStep


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_production_steps = ProductionStep.objects.filter(
        department__number=1
    )

    for production_step in target_production_steps:
        production_step.is_active = True
        production_step.next_step.clear()
        production_step.save()
