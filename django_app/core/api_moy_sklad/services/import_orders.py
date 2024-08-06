from typing import Iterable
import json

from .import_images import ImportImages
from ..adapters.create_order_product_entities import CreateOrderProductEntities
from ..adapters.order_adapter import OrderAdapter, OrderEntity, ProductInfo, ProductEntity
from ..adapters.product_adapter import ProductAdapter
from ..adapters.variant_adapter import VariantAdapter
from ..db_methods.order_entities_to_db import order_entities_to_db
from ..db_methods.order_product_entity_to_db import OrderProductEntityToDB
from ..db_methods.product_entities_to_db import ProductEntityToDB
from ..network.get_orders_data import GetOrdersData
from ..network.get_product_data import GetProductData
from ..network.get_variant_data import GetVariantData
from ..network.set_eq_link_in_order import set_eq_link_in_order


def nice_json(data):
    print(json.dumps(data, indent=4, ensure_ascii=False))


class ImportOrders:
    @staticmethod
    def get_product_entity_from_product_info(product_info: ProductInfo) -> ProductEntity:
        match product_info.type:
            case 'product':
                product_data = GetProductData().execute(product_info.id)
                return ProductAdapter().execute(product_data)
            case 'variant':
                variant_data = GetVariantData().execute(product_info.id)
                return VariantAdapter().execute(variant_data)
            case _:
                raise Exception()

    def execute(self):
        """Импорт данных с моего склада и формирование данных"""
        order_data: dict = GetOrdersData().execute()

        order_entities: Iterable[OrderEntity] | None = OrderAdapter().execute(order_data)

        for order_entity in order_entities:
            order = order_entities_to_db(order_entity)
            if not order_entity.link or order_entity.link.startswith('http://172.16.1.212/orders/'):
                set_eq_link_in_order(order_entity.order_id, str(order.id))

            """Формирование и сохранение товаров и тканей"""
            for product_info in order_entity.products_info:
                product_entity = self.get_product_entity_from_product_info(product_info)
                """Тут же создаются первые этапы производства если товар новый. """
                ProductEntityToDB().execute(product_entity)

                """Импорт изображений"""
                ImportImages().execute(product_entity)

            """Формирование и сохранение позиций заказа"""
            order_product_entities = CreateOrderProductEntities().execute(order_entity)
            for order_product_entity in order_product_entities:
                """Создаются позиции заказов и инициализируются наряды для новых позиций. """
                OrderProductEntityToDB().execute(order_product_entity)
