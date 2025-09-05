"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Assignment

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    active_order_positions = OrderProduct.objects.filter(status="0")

    for order_product in active_order_positions:
        if order_product.assignments.exclude(status="ready").exists():
            Assignment.objects.filter(
                order_product=order_product,
            ).update(
                sort_date=order_product.order.planned_date
            )
            continue
        print(f"{order_product.series_id} все наряды закрыты")
        order_product.status = "1"
        order_product.save()

    print('PASS')
    return f"Oki"
