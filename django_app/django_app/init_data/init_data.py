"""Initial methods and scripts. """
from core.models import Product, OrderProduct, Assignment
from core.services.assignment_generator import AssignmentGenerator
from core.services.update_production_steps import update_production_steps


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    Assignment.objects.filter(
        status="created"
    ).update(
        status="await",
        assembled=False
    )

    target_products = Product.objects.filter(
        technological_process__isnull=False,
        technological_process_confirmed__isnull=True
    )

    for product in target_products:
        update_production_steps(product)
        active_order_products = OrderProduct.objects.filter(
            status="0",
            product=product,
        )
        for order_product in active_order_products:
            AssignmentGenerator().init_order_product_assignments(order_product=order_product)
