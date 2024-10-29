"""Initial methods and scripts. """
from core.models import OrderProduct, ProductionStep, Assignment
from core.services.assignment_generator import AssignmentGenerator


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    current_op = OrderProduct.objects.filter(
        status="0"
    )

    for op in current_op:
        target_ps = ProductionStep.objects.filter(
            product=op.product,
            is_active=True,
        ).exclude(
            department__number__in=[0, 1, 50]
        )
        for ps in target_ps:
            has_assignments = Assignment.objects.filter(
                department=ps.department,
                order_product=op
            ).exists()

            if not has_assignments:
                print(f"Отдел {ps.department.name} серии {op.series_id} без нарядов!")
                AssignmentGenerator().init_order_product_assignments(op)
