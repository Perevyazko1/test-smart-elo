import logging

from django.db import transaction
from django.http import JsonResponse

from core.models import Order, OrderProduct
from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment
from src.ms_import.create_order_products import create_order_products
from src.ms_import.get_ms_orders import get_ms_orders, _fetch_order
from src.ms_import.import_images import import_images
from src.ms_import.lib import parse_datetime, get_attribute_value
from src.ms_import.order_product_to_db import order_product_to_db
from src.ms_import.order_to_db import order_to_db
from src.ms_import.product_to_db import product_to_db
from src.ms_import.put_elo_link import put_elo_link

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@transaction.atomic
def _update_order(
        order: SkladOrderExpandProjectPositionsAssortment,
        updated_products: list[str],
):
    try:
        db_order, created = order_to_db(order)
        logger.info(f"Заказ {db_order.id} {'создан' if created else 'обновлён'}")

        put_elo_link(
            order.id,
            get_attribute_value('Ссылка на спец-ю:', order.attributes),
            db_order.id
        )

        for position in order.positions.rows:
            try:
                # Считать и зафиксировать дату обновления изделия
                if position.assortment.id in updated_products:
                    continue
                updated_products.append(position.assortment.id)

                product = product_to_db(position.assortment, stock=position.stock)

                if product is None:
                    logger.info("Изделие не найдено либо не целевое")
                    continue

                logger.info(f"{product.name} {product.updated} {parse_datetime(position.assortment.updated)}")

                if product.updated == parse_datetime(position.assortment.updated):
                    logger.info("🐞 Product is actual")
                    continue

                import_images(position.assortment)
                product.updated = parse_datetime(position.assortment.updated)
                product.save()
                logger.info("🎉 Product updated")

            except Exception as e:
                logger.error(f"❌ Ошибка обработки позиции {position.assortment.name}: {e}", exc_info=True)
                raise

        order_products = create_order_products(order)
        for entity in order_products:
            order_product_to_db(entity)

        return updated_products
    except Exception as e:
        logger.error(f"⛔ Критическая ошибка при обновлении заказа: {e}", exc_info=True)
        raise


def import_ms(request = None):
    # Загружаем все заказы
    orders = get_ms_orders()

    updated_products = []
    updated_orders = []
    # Сохраняем все заказы
    for order in orders:
        updated_products = _update_order(order, updated_products)
        updated_orders.append(str(order.id))

    other_active_orders = Order.objects.filter(
        status="0"
    ).exclude(
        order_id__in=updated_orders
    )

    for order in other_active_orders:
        order_data = _fetch_order(str(order.order_id))
        updated_products = _update_order(order_data, updated_products)
        active_order_products = OrderProduct.objects.filter(order=order, status="0")
        logger.info(f"🤖 Персонально обновлен заказ {order_data.name} 🤖")
        if active_order_products.exists():
            continue
        order.status = "1"
        order.save()

    logger.info(f"🔸 Импортировано | обработано заказов: {len(orders)}")

    return JsonResponse({"data": f"🔸 Импортировано | обработано заказов: {len(orders)}"}, json_dumps_params={"ensure_ascii": False})