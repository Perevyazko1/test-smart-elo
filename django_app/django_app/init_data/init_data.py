"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Order

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    orders = Order.objects.filter(status="0")

    for order in orders:
        ops = OrderProduct.objects.filter(order=order, status="0")

        if ops.exists():
            continue
        order.status = "1"
        order.save()

    print('PASS')
    return f"Oki"
