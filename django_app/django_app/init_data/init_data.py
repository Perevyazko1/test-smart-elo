"""Initial methods and scripts. """
import datetime

from core.models import Assignment, Tariff, ProductionStep


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    production_steps_qs = ProductionStep.objects.filter(
        confirmed_tariff__isnull=False,
        proposed_tariff__isnull=False,
        department__piecework_wages=True,
        is_active=True,
    )

    for production_step in production_steps_qs:
        Assignment.objects.filter(
            order_product__product=production_step.product,
            department=production_step.department,
        ).update(new_tariff=production_step.confirmed_tariff)
