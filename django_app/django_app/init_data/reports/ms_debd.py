import collections
from dataclasses import dataclass, field
from pprint import pprint
from typing import Optional, TypeVar, Generic, List, Callable, Iterable

from pydantic import BaseModel

from src.api.sklad_client import SkladClient

# --- КОНСТАНТЫ (без изменений) ---
PRODUCT_GROUPS = [
    'Мебель и готовые изделия/Випы',
    'Мебель и готовые изделия/Мебель "Серийная"',
    'Мебель и готовые изделия/Подушки декоративные',
    'Мебель и готовые изделия/Прочее',
    'Мебель и готовые изделия/РЕКЛАМАЦИЯ',
]

FABRIC_GROUPS = [
    'Закупка материалов (для производства, составляющие изделия)/Ткани',
]


# --- МОДЕЛИ Pydantic (без изменений) ---
# ... (все твои модели Sklad... остаются здесь)
class SkladBaseMetadata(BaseModel):
    href: str

    class Config: extra = "ignore"


class SkladProduct(BaseModel):
    meta: SkladBaseMetadata
    id: str
    name: str
    pathName: Optional[str] = None

    class Config: extra = "ignore"


class SkladPosition(BaseModel):
    quantity: float
    assortment: SkladProduct

    class Config: extra = "ignore"


class SkladListMetadata(SkladBaseMetadata):
    size: int
    limit: int
    offset: int

    class Config: extra = "ignore"


G = TypeVar('G')


class SkladApiListResponse(BaseModel, Generic[G]):
    meta: SkladListMetadata
    rows: list[G]

    class Config: extra = "ignore"


class SkladDemandAssortment(BaseModel):
    meta: SkladBaseMetadata


class SkladDemandPosition(BaseModel):
    quantity: float
    assortment: SkladDemandAssortment


class SkladDemand(BaseModel):
    positions: SkladApiListResponse[SkladDemandPosition]
    name: str
    id: str
    meta: SkladBaseMetadata


class SkladOrder(BaseModel):
    positions: SkladApiListResponse[SkladPosition]
    name: str
    id: str
    meta: SkladBaseMetadata
    demands: Optional[list[SkladDemand]] = None

    class Config: extra = "ignore"


# --- НОВЫЕ СТРУКТУРЫ И ФУНКЦИИ ---

T = TypeVar('T')


@dataclass
class GroupedPosition:
    """
    Класс для представления сгруппированной позиции: изделие + список тканей.
    """
    main_item: SkladProduct | SkladDemandAssortment
    quantity: float
    components: List[SkladProduct | SkladDemandAssortment] = field(default_factory=list)

    def get_component_hrefs(self) -> frozenset[str]:
        """Возвращает неизменяемый и отсортированный набор ссылок на ткани для использования в качестве ключа."""
        return frozenset(sorted(c.meta.href for c in self.components))

    def get_main_item_href(self) -> str:
        return self.main_item.meta.href


def _group_positions_generator(
        items: Iterable[T],
        is_main_item: Callable[[T], bool],
        is_component: Callable[[T], bool],
) -> Iterable[GroupedPosition]:
    """
    Универсальный генератор для группировки позиций.
    Проходит по списку и, встретив "главный" элемент, начинает собирать
    следующие за ним "компоненты" до тех пор, пока не встретит следующий
    "главный" элемент или другой товар, не являющийся компонентом.
    """
    current_group: Optional[GroupedPosition] = None

    for item in items:
        # Пытаемся получить ассортимент, работает для SkladPosition и SkladDemandPosition
        assortment = getattr(item, 'assortment', None)
        if not assortment:
            continue

        if is_main_item(item):
            if current_group:
                yield current_group  # Завершаем предыдущую группу
            # Начинаем новую группу
            current_group = GroupedPosition(main_item=assortment, quantity=item.quantity)
        elif is_component(item) and current_group:
            # Добавляем компонент (ткань) в текущую группу
            current_group.components.append(assortment)
        else:
            # Если встретили другой товар (не главный и не компонент), завершаем группу
            if current_group:
                yield current_group
                current_group = None

    # Не забываем вернуть последнюю группу в списке
    if current_group:
        yield current_group


def process_product_orders(product_name: str):
    """
    Основная функция: ищет заказы по названию товара и сопоставляет
    заказанные позиции с отгруженными, корректно суммируя количество.
    """
    client = SkladClient()
    product_list = client.get(
        f'entity/product?filter=name={product_name}',
        SkladApiListResponse[SkladProduct]
    )
    if not product_list.meta.size == 1:
        print("Найдено 0 или несколько товаров с названием")
        return

    product = product_list.rows[0]
    print(f"Найден товар: {product.name} ({product.meta.href})")

    # Поиск заказов

    url_orders = "/entity/customerorder?expand=positions,positions.assortment,demands,demands.positions&limit=10"
    url_orders += f"&filter=assortment={product.meta.href}"
    orders_list = client.get(url_orders, SkladApiListResponse[SkladOrder])

    if not orders_list or orders_list.meta.size == 0:
        print("Заказы с этим товаром не найдены.")
        return

    print(f"Найдено заказов: {orders_list.meta.size}")

    # Определяем "условия" для группировки позиций в заказе
    is_target_product_in_order = lambda pos: pos.assortment.name == product_name
    is_fabric_in_order = lambda pos: pos.assortment.pathName in FABRIC_GROUPS

    for order in orders_list.rows:
        print(f"\n{'=' * 20}\nЗаказ №{order.name}\n{'=' * 20}")

        # 1. Группируем позиции в самом заказе
        order_grouped_positions = list(_group_positions_generator(
            order.positions.rows,
            is_main_item=is_target_product_in_order,
            is_component=is_fabric_in_order
        ))

        # 2. Обрабатываем все отгрузки ОДИН РАЗ и кэшируем результаты
        # Ключ - (ссылка_на_товар, frozenset_ссылок_на_ткани), значение - суммарное кол-во
        shipped_quantities = collections.defaultdict(float)
        if order.demands:
            print(f"Анализ {len(order.demands)} отгрузок...")
            # Определяем условия для группировки в отгрузках (по ссылкам)
            is_target_product_in_demand = lambda d_pos: d_pos.assortment.meta.href == product.meta.href
            is_fabric_in_demand = lambda d_pos: any(
                d_pos.assortment.meta.href == fabric.assortment.meta.href
                for fabric in order.positions.rows if fabric.assortment.pathName in FABRIC_GROUPS
            )

            for demand in order.demands:
                demand_grouped_positions = _group_positions_generator(
                    demand.positions.rows,
                    is_main_item=is_target_product_in_demand,
                    is_component=is_fabric_in_demand
                )
                for group in demand_grouped_positions:
                    # Создаем уникальный ключ для этой комбинации "товар + ткани"
                    key = (group.get_main_item_href(), group.get_component_hrefs())
                    shipped_quantities[key] += group.quantity

        # 3. Сопоставляем заказанные и отгруженные позиции
        if not order_grouped_positions:
            print("В заказе не найдено целевых позиций для анализа.")
            continue

        for i, group in enumerate(order_grouped_positions, 1):
            print(f"\n--- Позиция {i} ---")
            print(f"🛍️  {group.main_item.name} ({group.quantity} шт.)")
            if group.components:
                print("  Ткани:")
                for fabric in group.components:
                    print(f"  - {fabric.name}")

            # Ищем отгруженное количество в нашей кэш-карте
            lookup_key = (group.get_main_item_href(), group.get_component_hrefs())
            total_shipped = shipped_quantities[lookup_key]

            print(f"\n✅ Заказано: {group.quantity}")
            print(f"🚚 Отгружено всего: {total_shipped}")


# --- ЗАПУСК ---
if __name__ == "__main__":
    # Укажи здесь название товара для теста
    target_product_name = "Спринг бокс (800*2000 мм)"
    process_product_orders(target_product_name)