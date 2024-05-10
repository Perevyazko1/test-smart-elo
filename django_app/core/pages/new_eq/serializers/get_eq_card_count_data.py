from core.models import ProductionStep, OrderProduct
from staff.models import Department


def get_eq_card_count_data(order_product: OrderProduct, department: Department):
    target_production_step = ProductionStep.objects.filter(
        product=order_product.product,
        department=department
    )

    if target_production_step.exists():
        production_step = target_production_step[0]

        if production_step.production_step_tariff:
            tariff = production_step.production_step_tariff.tariff
            proposed_tariff = production_step.production_step_tariff.proposed_tariff
        else:
            tariff = 0
            proposed_tariff = 0

        queryset = order_product.assignments.filter(department=department)
        in_work_count = queryset.filter(status='in_work').count(),

        ready_count = queryset.filter(status='ready').count(),
        await_count = queryset.filter(status='await').count(),
    else:
        tariff = 0
        proposed_tariff = 0
        in_work_count = [0]
        ready_count = [0]
        await_count = [0]

    count_all = order_product.quantity,

    return {
        "tariff": tariff,
        "proposed_tariff": proposed_tariff,
        "count_all": count_all[0],
        "count_in_work": in_work_count[0],
        "count_ready": ready_count[0],
        "count_await": await_count[0],
    }
