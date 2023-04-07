from dataclasses import dataclass
from decimal import Decimal

from ..adapters.order_adapter import OrderEntity
from ..config import DEFAULT_URGENCY_LEVEL, PRODUCT_GROUPS, FABRIC_GROUPS


@dataclass
class OrderProductEntity:
    """Тип данных описывающий сущность позиции заказа"""
    series_id: str = ''
    order_id: str = ''
    product_id: str = ''
    main_fabric_id: str | None = None
    second_fabric_id: str | None = None
    third_fabric_id: str | None = None
    quantity: int = 1
    price: Decimal = Decimal(0.00)
    urgency: int = DEFAULT_URGENCY_LEVEL
    comment_base: str = ''
    comment_case: str = ''


class CreateOrderProductEntities:
    @staticmethod
    def _get_base_order_product(order_entity: OrderEntity) -> OrderProductEntity:
        """Инициализация нового объекта продукта заказа"""
        return OrderProductEntity(
            order_id=order_entity.order_id,
            urgency=order_entity.urgency,
            comment_base=order_entity.comment_base,
            comment_case=order_entity.comment_case,
        )

    @staticmethod
    def _index_number_generator(order_entity: OrderEntity, start_index: int = 1):
        while True:
            yield '{' + str(start_index) + '}' + order_entity.number
            start_index += 1

    def execute(self, order_entity: OrderEntity) -> list[OrderProductEntity]:
        result = []

        order_product_entity = self._get_base_order_product(order_entity)

        generator = self._index_number_generator(order_entity)

        for product_info in order_entity.products_info:
            if product_info.group in PRODUCT_GROUPS:
                """Если группа продукта содержится в целевом списке групп товаров, фиксируем ее как основной продукт"""
                if order_product_entity.product_id:
                    """Если основной продукт уже задан - добавляем имеющийся объект в результат и инициализируем 
                    новый"""
                    result.append(order_product_entity)
                    order_product_entity = self._get_base_order_product(order_entity)

                order_product_entity.series_id = next(generator)
                order_product_entity.product_id = product_info.id
                order_product_entity.price = product_info.price
                order_product_entity.quantity = product_info.quantity
                continue

            elif product_info.group in FABRIC_GROUPS:
                """Если группа товара в целевом списке тканей, фиксируем ее как ткань"""
                if not order_product_entity.main_fabric_id:
                    """Если основная ткань еще не указана то помещаем сюда"""
                    order_product_entity.main_fabric_id = product_info.id
                    continue

                elif not order_product_entity.second_fabric_id:
                    """Аналогично вторичная ткань"""
                    order_product_entity.second_fabric_id = product_info.id
                    continue

                elif not order_product_entity.third_fabric_id:
                    """Аналогично третья ткань"""
                    order_product_entity.third_fabric_id = product_info.id
                    continue

            else:
                raise Exception()

        """На выходе из цикла добавляем в результат последний объект"""
        result.append(order_product_entity)

        return result
