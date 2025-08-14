import logging

from django.db import transaction

from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment
from src.ms_import.create_order_products import create_order_products
from src.ms_import.get_ms_orders import get_ms_orders
from src.ms_import.import_images import import_images
from src.ms_import.lib import parse_datetime, get_attribute_value
from src.ms_import.order_product_to_db import order_product_to_db
from src.ms_import.order_to_db import order_to_db
from src.ms_import.product_to_db import product_to_db
from src.ms_import.put_elo_link import put_elo_link

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@transaction.atomic
def _update_order(order: SkladOrderExpandProjectPositionsAssortment, updated_products: list[str]):
    try:
        db_order, _ = order_to_db(order)
        put_elo_link(
            order.id,
            get_attribute_value('Ссылка на спец-ю:', order.attributes),
            db_order.id
        )

        for position in order.positions.rows:
            # Считать и зафиксировать дату обновления изделия
            if position.assortment.id in updated_products:
                continue

            product = product_to_db(position.assortment)

            if product is None:
                continue

            updated_products.append(position.assortment.id)

            if product.updated == parse_datetime(position.assortment.updated):
                logger.info("🐞 Product is actual")
                continue

            import_images(position.assortment)
            product.updated = parse_datetime(position.assortment.updated)
            product.save()
            logger.info("🎉 Product updated")

        order_products = create_order_products(order)
        for entity in order_products:
            order_product_to_db(entity)

        return updated_products
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        raise


def import_ms():
    # Загружаем все заказы
    orders = get_ms_orders()

    updated_products = []
    # Сохраняем все заказы
    for order in orders:
        updated_products = _update_order(order, updated_products)

    logger.info(f"🔸 Импортировано | обработано заказов: {len(orders)}")
