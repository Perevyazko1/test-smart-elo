import datetime

from core.models import ProductionStep, Assignment
from staff.models import Employee


def update_product_tax(product_id: int, pin_code: int, department_number: int, tax: int):
    production_step = ProductionStep.objects.get(
        product__id=product_id,
        department__number=department_number
    )
    production_step.tax = tax
    production_step.confirmation_date = datetime.datetime.now()
    production_step.approved_by = Employee.objects.get(pin_code=pin_code)
    production_step.save()

    Assignment.objects.filter(
        order_product__product__id=product_id,
        department__number=department_number,
        price=0,
    ).update(tax=tax)
