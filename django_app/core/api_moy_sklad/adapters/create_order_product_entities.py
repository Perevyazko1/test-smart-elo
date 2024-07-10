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
    group: str = ''


class CreateOrderProductEntities:
    @staticmethod
    def _get_base_order_product(order_entity: OrderEntity) -> OrderProductEntity:
        """Инициализация нового объекта продукта заказа"""
        return OrderProductEntity(
            order_id=order_entity.order_id,
            urgency=order_entity.urgency,
        )

    @staticmethod
    def _index_number_generator(order_entity: OrderEntity, start_index: int = 1):
        while True:
            yield '{' + str(start_index) + '}' + order_entity.number
            start_index += 1

    def execute(self, order_entity: OrderEntity) -> list[OrderProductEntity]:
        # Если в заказе нет позиций - возвращаем пустой массив
        if len(order_entity.products_info) == 0:
            return []

        result = []
        current_products = []

        generator = self._index_number_generator(order_entity)

        for product_info in order_entity.products_info:
            if product_info.group in PRODUCT_GROUPS:
                """Если группа продукта содержится в целевом списке групп товаров, фиксируем ее как основной продукт"""
                if current_products and product_info.group == 'Мебель и готовые изделия/Прочее':
                    """
                    Если текущий продукт относится к группе 'Прочие', добавляем все текущие продукты в результат 
                    и начинаем новый цикл
                    """
                    result.extend(current_products)
                    current_products = []

                order_product_entity = self._get_base_order_product(order_entity)
                order_product_entity.series_id = next(generator)
                order_product_entity.product_id = product_info.id
                order_product_entity.price = product_info.price
                order_product_entity.quantity = product_info.quantity
                order_product_entity.group = product_info.group
                current_products.append(order_product_entity)
                continue

            elif product_info.group in FABRIC_GROUPS:
                """Если группа товара в целевом списке тканей, фиксируем ее как ткань"""
                for product in current_products:
                    if product.group != 'Мебель и готовые изделия/Прочее':
                        if not product.main_fabric_id:
                            product.main_fabric_id = product_info.id
                        elif not product.second_fabric_id:
                            product.second_fabric_id = product_info.id
                        elif not product.third_fabric_id:
                            product.third_fabric_id = product_info.id
                continue

            else:
                raise Exception()

        """На выходе из цикла добавляем в результат все текущие продукты"""
        result.extend(current_products)

        return result
