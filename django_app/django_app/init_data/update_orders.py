"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Order
from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment, SkladApiListResponse
from src.ms_import.config import ORDER_EXPAND
from src.ms_import.create_order_products import create_order_products

logger = logging.getLogger(__name__)


def _fetch_orders(offset=0):
    client = SkladClient()

    params = {
        "expand": ','.join(map(str, ORDER_EXPAND)),
        "limit": 100,
        "offset": offset,
        "fields": "stock",
    }

    order_list = client.get(
        "entity/customerorder",
        SkladApiListResponse[SkladOrderExpandProjectPositionsAssortment],
        params=params
    )
    return order_list


# LIMIT = 400

def get_ms_orders() -> list[SkladOrderExpandProjectPositionsAssortment]:
    offset = 0
    limit = 100
    all_orders = []

    while True:
        print(f"Пошел запрос с {offset} по {limit + offset}")
        order_data = _fetch_orders(offset)
        all_orders.extend(order_data.rows)
        if len(all_orders) >= order_data.meta.size:
            break
        offset += limit
        # if offset >= LIMIT:
        #     break

    return all_orders


def update_orders():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    order_list = get_ms_orders()

    for order in order_list:
        db_order = Order.objects.filter(order_id=order.id)
        if not db_order.exists():
            continue

        order_products = create_order_products(order)

        for entity in order_products:
            try:
                order_product = OrderProduct.objects.get(series_id=entity.series_id)

                if order_product.product.product_id == entity.product_id or order_product.product.name == entity.product_name:
                    print(f"▶️▶️▶️ {order_product.product.name} {entity.shipped} {order_product.shipped}")
                    order_product.shipped = entity.shipped
                    order_product.price = entity.price
                    order_product.save()
                else:
                    print(f"🤖 Позиция была изменена {order_product.series_id} 🤖")
            except:
                print("🐞 Не сходится по заказу 🐞", entity.series_id)

    print('PASS')
    return f"Oki"
