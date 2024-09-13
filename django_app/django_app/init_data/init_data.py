"""Initial methods and scripts. """
from core.models import Assignment, ProductionStep, OrderProduct


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_production_steps = ProductionStep.objects.filter(
        confirmed_tariff__isnull=False
    )
    for production_step in target_production_steps:
        Assignment.objects.filter(
            order_product__product=production_step.product,
            new_tariff__isnull=True,
            department=production_step.department,
        ).update(
            new_tariff=production_step.confirmed_tariff,
            amount=production_step.confirmed_tariff.amount,
        )

