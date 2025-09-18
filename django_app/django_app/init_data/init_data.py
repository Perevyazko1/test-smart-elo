"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Assignment
from src.ms_import.ms_import import _check_order_product_full_ready

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    order_products = OrderProduct.objects.all()

    for order_product in order_products:
        if order_product.status == "2":
            continue

        if not _check_order_product_full_ready(order_product):
            if order_product.status != "0":
                logger.warning(f"Позиция {order_product.series_id} переведена в активный статус ✅")
                order_product.status = "0"
                order_product.save()
        else:
            if order_product.status != "1":
                logger.warning(f"Позиция {order_product.series_id} закрыта ❌")
                order_product.status = "1"
                order_product.save()

    print('PASS')
    return f"Oki"
