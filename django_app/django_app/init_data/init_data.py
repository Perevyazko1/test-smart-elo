"""Initial methods and scripts. """
import datetime

from core.models import Assignment, Tariff, ProductionStep


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    production_steps_qs = ProductionStep.objects.filter(
        production_step_tariff__isnull=False,
        confirmed_tariff__isnull=True,
        proposed_tariff__isnull=True,
        department__piecework_wages=True,
        is_active=True,
    )

    for production_step in production_steps_qs:
        if production_step.production_step_tariff.proposed_by:
            production_step.proposed_tariff = Tariff.objects.create(
                amount=production_step.production_step_tariff.proposed_tariff,
                add_date=production_step.production_step_tariff.proposed_date or datetime.datetime.now(),
                created_by=production_step.production_step_tariff.proposed_by,
                comment=f'#PS-{production_step.id}# Инициализирован автоматически'
            )
        if production_step.production_step_tariff.approved_by:
            new_tariff = Tariff.objects.create(
                amount=production_step.production_step_tariff.tariff,
                add_date=production_step.production_step_tariff.confirmation_date,
                created_by=production_step.production_step_tariff.approved_by,
                comment=f'#PS-{production_step.id}# Инициализирован автоматически'
            )
            production_step.confirmed_tariff = new_tariff
            Assignment.objects.filter(
                order_product__product=production_step.product,
                department=production_step.department,
                inspector__isnull=False,
            ).update(new_tariff=new_tariff)

        production_step.save()
