"""Initial methods and scripts."""

import logging

from core.models import Product, OrderProduct, Assignment
from core.services.assignment_generator import AssignmentGenerator
from staff.models import Department

logger = logging.getLogger()

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    target_products = Product.objects.filter(
        technological_process__isnull=False,
        technological_process_confirmed__isnull=True,
    )
    print("PRODUCTS", target_products.count())

    target_ops = OrderProduct.objects.filter(
        product__in=target_products,
    )
    print("OPS", target_ops.count())

    target_dep = Department.objects.get(number=1)

    for op in target_ops:
        if not Assignment.objects.filter(order_product=op, department=target_dep).exists():
            AssignmentGenerator().init_order_product_assignments(op)

    return "Oki"
