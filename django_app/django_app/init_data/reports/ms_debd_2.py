import collections
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, TypeVar, Generic, List, Callable, Iterable

import pandas as pd
from pydantic import BaseModel

# Замени на твой реальный SkladClient
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


# --- МОДЕЛИ Pydantic (обновлены) ---
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

    class Config:
        extra = "ignore"


class SkladListMetadata(SkladBaseMetadata):
    size: int
    limit: int
    offset: int

    class Config:
        extra = "ignore"


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
    moment: Optional[str] = None  # <-- ДОБАВЛЕНО: Дата отгрузки

    class Config: extra = "ignore"


class SkladProject(BaseModel):
    name: str


class SkladOrder(BaseModel):
    positions: SkladApiListResponse[SkladPosition]
    project: Optional[SkladProject]
    name: str
    id: str
    meta: SkladBaseMetadata
    moment: Optional[str] = None  # <-- ДОБАВЛЕНО: Дата заказа
    demands: Optional[list[SkladDemand]] = None

    class Config: extra = "ignore"


# --- СЛУЖЕБНЫЕ КЛАССЫ И ФУНКЦИИ (без изменений) ---

T = TypeVar('T')


@dataclass
class GroupedPosition:
    main_item: SkladProduct | SkladDemandAssortment
    quantity: float
    components: List[SkladProduct | SkladDemandAssortment] = field(default_factory=list)

    def get_component_hrefs(self) -> frozenset[str]:
        return frozenset(sorted(c.meta.href for c in self.components))

    def get_main_item_href(self) -> str:
        return self.main_item.meta.href


def _group_positions_generator(
        items: Iterable[T],
        is_main_item: Callable[[T], bool],
        is_component: Callable[[T], bool],
) -> Iterable[GroupedPosition]:
    current_group: Optional[GroupedPosition] = None
    for item in items:
        assortment = getattr(item, 'assortment', None)
        if not assortment: continue
        if is_main_item(item):
            if current_group: yield current_group
            current_group = GroupedPosition(main_item=assortment, quantity=item.quantity)
        elif is_component(item) and current_group:
            current_group.components.append(assortment)
        else:
            if current_group:
                yield current_group
                current_group = None
    if current_group: yield current_group


def generate_excel_report(product_name: str):
    """
    Основная функция: ищет заказы, сопоставляет их с отгрузками
    и генерирует Excel-отчет.
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
    print(f"✅ Найден товар: {product.name} ({product.meta.href})")

    url_orders = "/entity/customerorder?expand=positions,positions.assortment,demands,demands.positions,project&limit=100"
    url_orders += f"&filter=assortment={product.meta.href}"
    orders_list = client.get(url_orders, SkladApiListResponse[SkladOrder])

    if not orders_list or orders_list.meta.size == 0:
        print("ℹ️ Заказы с этим товаром не найдены.")
        return

    print(f"📊 Найдено заказов для анализа: {orders_list.meta.size}")

    report_data = []  # Список для хранения строк будущего отчета

    # Определяем "условия" для группировки позиций
    is_target_product_in_order = lambda pos: pos.assortment.name == product_name
    is_fabric_in_order = lambda pos: pos.assortment.pathName in FABRIC_GROUPS
    is_target_product_in_demand = lambda d_pos: d_pos.assortment.meta.href == product.meta.href

    for order in orders_list.rows:
        print(f"   ...Обработка заказа №{order.name}")
        # 1. Группируем позиции в самом заказе
        order_grouped_positions = list(_group_positions_generator(
            order.positions.rows, is_target_product_in_order, is_fabric_in_order
        ))

        # 2. Собираем детальную информацию по отгрузкам
        shipped_details = collections.defaultdict(list)
        if order.demands:
            # Получаем все ссылки на ткани в заказе для точной проверки в отгрузках
            fabric_hrefs_in_order = {
                f.assortment.meta.href
                for f in order.positions.rows if f.assortment.pathName in FABRIC_GROUPS
            }
            is_fabric_in_demand = lambda d_pos: d_pos.assortment.meta.href in fabric_hrefs_in_order

            for demand in order.demands:
                demand_grouped_positions = _group_positions_generator(
                    demand.positions.rows, is_target_product_in_demand, is_fabric_in_demand
                )
                for group in demand_grouped_positions:
                    key = (group.get_main_item_href(), group.get_component_hrefs())
                    shipped_details[key].append({
                        "name": demand.name,
                        "moment": demand.moment,
                        "quantity": group.quantity,
                    })

        # 3. Формируем строки для отчета
        order_date = datetime.fromisoformat(order.moment.replace(" ", "T")).strftime("%Y-%m-%d") if order.moment else ""

        for i, group in enumerate(order_grouped_positions, 1):
            lookup_key = (group.get_main_item_href(), group.get_component_hrefs())
            shipments = shipped_details.get(lookup_key, [])
            total_shipped = sum(s["quantity"] for s in shipments)
            fabric_names = ", ".join(c.name for c in group.components) or "Без ткани"

            base_row = {
                "Заказ": order.name, "Проект": order.project.name if order.project else "Без проекта",
                "Дата заказа": order_date, "Позиция": i,
                "Товар": group.main_item.name, "Ткани": fabric_names,
                "Заказано": group.quantity, "Отгружено (итого)": total_shipped,
            }

            if not shipments:
                report_data.append({**base_row, "№ отгрузки": "-", "Дата отгрузки": "-", "Отгружено (шт)": 0})
            else:
                for s in shipments:
                    shipment_date = datetime.fromisoformat(s["moment"].replace(" ", "T")).strftime("%Y-%m-%d") if s[
                        "moment"] else ""
                    report_data.append({
                        **base_row, "№ отгрузки": s["name"], "Дата отгрузки": shipment_date,
                        "Отгружено (шт)": s["quantity"],
                    })

    # 4. Создаем и сохраняем Excel файл
    if not report_data:
        print("ℹ️ Нет данных для создания отчета.")
        return

    df = pd.DataFrame(report_data)

    column_order = [
        "Заказ", "Проект", "Дата заказа", "Позиция", "Товар", "Ткани",
        "Заказано", "Отгружено (итого)", "№ отгрузки", "Дата отгрузки", "Отгружено (шт)"
    ]
    df = df[column_order]

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filename = f"report_{product_name.replace(' ', '_').replace('/', '_')}_{timestamp}.xlsx"

    try:
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"\n🎉 Отчет успешно сохранен в файл: {filename}")
    except Exception as e:
        print(f"\n❌ Не удалось сохранить отчет. Ошибка: {e}")


# --- ЗАПУСК ---
if __name__ == "__main__":
    target_product_name = "Спринг бокс (01, 900*2000 мм)"  # <-- Укажи здесь название товара
    generate_excel_report(target_product_name)
