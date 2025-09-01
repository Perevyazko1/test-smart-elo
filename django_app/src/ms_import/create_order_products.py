from decimal import Decimal, InvalidOperation

from pydantic import BaseModel

from src.api.sklad_schemas import SkladOrderExpandProjectPositionsAssortment
from src.ms_import.config import DEFAULT_URGENCY_LEVEL, PRODUCT_GROUPS, FABRIC_GROUPS
from src.ms_import.lib import get_attribute_value


class OrderProductEntity(BaseModel):
    series_id: str = ''
    order_id: str = ''
    product_id: str = ''
    main_fabric_id: str | None = None
    second_fabric_id: str | None = None
    third_fabric_id: str | None = None
    quantity: int = 1
    shipped: float = 0
    price: Decimal = Decimal(0.00)
    urgency: int = DEFAULT_URGENCY_LEVEL
    group: str = ''


def _get_base_order_product(order: SkladOrderExpandProjectPositionsAssortment) -> OrderProductEntity:
    """Инициализация нового объекта продукта заказа"""
    value = int(get_attribute_value("Срочность", order.attributes) or DEFAULT_URGENCY_LEVEL)
    urgency = value if 1 <= value <= 4 else DEFAULT_URGENCY_LEVEL
    return OrderProductEntity(
        order_id=order.id,
        urgency=urgency,
    )


def _index_number_generator(order: SkladOrderExpandProjectPositionsAssortment, start_index: int = 1):
    while True:
        yield str(start_index) + '-' + order.name
        start_index += 1


def create_order_products(order: SkladOrderExpandProjectPositionsAssortment) -> list[OrderProductEntity]:
    # Если в заказе нет позиций - возвращаем пустой массив
    if len(order.positions.rows) == 0:
        return []

    result = []
    current_products = []
    fabrics_applied = False  # флаг: к текущей группе уже добавляли ткани

    # Генератор номера серии
    generator = _index_number_generator(order)

    # Учет комиссионных
    commission_percent = Decimal('1')
    commission_val = get_attribute_value("Комиссионные", order.attributes)
    if commission_val:
        try:
            commission_decimal = Decimal(commission_val)
            order_sum_decimal = Decimal(order.sum)

            if order_sum_decimal != Decimal('0'):
                commission_percent = Decimal('1') - (commission_decimal / (order_sum_decimal / Decimal('100')))
        except InvalidOperation:
            print(
                f"Warning: Значение атрибута 'Комиссионные' '{commission_val}' не является допустимым числом. Используется значение commission_percent по умолчанию (1).")

    for position in order.positions.rows:
        group = position.assortment.pathName
        if group in PRODUCT_GROUPS:
            """Начинается новое изделие"""
            if group == 'Мебель и готовые изделия/Прочее':
                # Завершаем текущую группу изделий (если была)
                if current_products:
                    result.extend(current_products)
                    current_products = []
                    fabrics_applied = False

                # Прочее — отдельная позиция без тканей, сразу в результат
                order_product_entity = _get_base_order_product(order)
                order_product_entity.series_id = next(generator)
                order_product_entity.shipped = position.shipped
                print("▶️▶️▶️▶️", position.shipped, "◀️◀️◀️◀️")
                order_product_entity.product_id = position.assortment.id
                order_product_entity.price = ((Decimal(position.price) / Decimal('100')) * commission_percent).quantize(Decimal('0.00'))
                order_product_entity.quantity = int(position.quantity)
                order_product_entity.group = group
                result.append(order_product_entity)
                continue

            # Обычное мягкое изделие
            # Если к текущей группе уже применялись ткани — это новая группа изделий
            if fabrics_applied and current_products:
                result.extend(current_products)
                current_products = []
                fabrics_applied = False

            order_product_entity = _get_base_order_product(order)
            order_product_entity.series_id = next(generator)
            order_product_entity.product_id = position.assortment.id
            order_product_entity.shipped = position.shipped
            print("▶️▶️▶️▶️", position.shipped, "◀️◀️◀️◀️")
            order_product_entity.price = ((Decimal(position.price) / Decimal('100')) * commission_percent).quantize(Decimal('0.00'))
            order_product_entity.quantity = int(position.quantity)
            order_product_entity.group = group
            current_products.append(order_product_entity)
            continue

        elif group in FABRIC_GROUPS:
            """Ткань «приклеивается» ко всем изделиям текущей группы (кроме 'Прочее')"""
            for product in current_products:
                if product.group != 'Мебель и готовые изделия/Прочее':
                    if not product.main_fabric_id:
                        product.main_fabric_id = position.assortment.id
                    elif not product.second_fabric_id:
                        product.second_fabric_id = position.assortment.id
                    elif not product.third_fabric_id:
                        product.third_fabric_id = position.assortment.id
            # Отметим, что к текущей группе уже добавляли ткани
            if current_products:
                fabrics_applied = True
            continue

        else:
            continue

    """На выходе из цикла добавляем в результат все текущие продукты"""
    result.extend(current_products)

    return result
