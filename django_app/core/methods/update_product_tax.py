import datetime

from core.models import ProductionStep, Assignment, ProductionStepTariff, Product
from staff.models import Employee, Department


def update_product_tax(product_id: int, pin_code: int, department_number: int, tariff: int):
    product = Product.objects.get(id=product_id)
    department = Department.objects.get(number=department_number)

    production_step = ProductionStep.objects.get(
        product=product,
        department=department
    )
    production_step_tariff = ProductionStepTariff.objects.create(
        product=product,
        department=department,
        tariff=tariff,
        approved_by=Employee.objects.get(pin_code=pin_code)
    )

    production_step.production_step_tariff = production_step_tariff
    production_step.save()

    Assignment.objects.filter(
        order_product__product__id=product_id,
        department__number=department_number,
        tariff__isnull=True,
    ).update(tariff=production_step_tariff)
