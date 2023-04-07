from dataclasses import dataclass
from typing import Iterable
from decimal import Decimal

from ..config import TARGET_PRODUCT_GROUPS, DEFAULT_URGENCY_LEVEL
from ..network.get_image_data import ImageInfo


@dataclass
class ProductInfo:
    id: str
    group: str
    type: str
    quantity: int
    price: Decimal


@dataclass
class OrderEntity:
    """Тип данных описывающий сущность заказа"""
    order_id: str
    number: str
    project: str
    planned_date: str
    urgency: int
    comment_base: str
    comment_case: str
    products_info: list[ProductInfo]


@dataclass
class ProductEntity:
    """Тип данных описывающий сущность продукта"""
    id: str
    name: str
    type: str
    group: str
    images_info: list[ImageInfo]


class OrderAdapter:
    @staticmethod
    def _get_target_attribute_value(attribute_name: str, order: dict):
        for attribute in order.get('attributes'):
            if attribute.get('name') == attribute_name:
                return attribute.get('value')
        return ''

    def _get_planned_date(self, attribute_name, order):
        planned_date_data = self._get_target_attribute_value(attribute_name, order)
        if planned_date_data:
            return planned_date_data[0:10]
        return None

    def _get_urgency(self, attribute_name, order):
        get_urgency_data = self._get_target_attribute_value(attribute_name, order)
        if get_urgency_data:
            return get_urgency_data
        return DEFAULT_URGENCY_LEVEL

    @staticmethod
    def _get_products_info(order: dict) -> list[ProductInfo]:
        result = []

        for product in order.get('positions', {}).get('rows'):
            product_type = product['assortment']['meta']['type']
            if product_type == 'product':
                product_group = product['assortment']['pathName']
            elif product_type == 'variant':
                product_group = product['assortment']['product']['pathName']
            else:
                continue

            if product_group not in TARGET_PRODUCT_GROUPS:
                continue

            result.append(
                ProductInfo(
                    id=product['assortment']['id'],
                    type=product_type,
                    group=product_group,
                    quantity=product['quantity'],
                    price=Decimal(product['price'] / 100)
                )
            )

        return result

    def _order_dict_to_entity(self, order: dict) -> OrderEntity:
        return OrderEntity(
            order_id=order['id'],
            number=order['name'],
            project=order.get('project', {}).get('name', ''),
            planned_date=self._get_planned_date("Произв. (пл. Дата):", order),
            urgency=self._get_urgency("Срочность", order),
            comment_base=self._get_target_attribute_value("Коммент. (каркас):", order),
            comment_case=self._get_target_attribute_value("Коммент. (чехол):", order),
            products_info=self._get_products_info(order)
        )

    def execute(self, order_data: dict) -> Iterable[OrderEntity]:
        return map(self._order_dict_to_entity, order_data.get('rows'))
