import collections
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, TypeVar, Generic, List, Callable, Iterable

import pandas as pd
from pydantic import BaseModel

from src.api.sklad_client import SkladClient

# --- КОНСТАНТЫ И МОДЕЛИ (без изменений) ---
PRODUCT_GROUPS = [
    'Мебель и готовые изделия/Випы', 'Мебель и готовые изделия/Мебель "Серийная"',
    'Мебель и готовые изделия/Подушки декоративные', 'Мебель и готовые изделия/Прочее',
    'Мебель и готовые изделия/РЕКЛАМАЦИЯ',
]
FABRIC_GROUPS = ['Закупка материалов (для производства, составляющие изделия)/Ткани']


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
    moment: Optional[str] = None

    class Config: extra = "ignore"


class SkladProject(BaseModel):
    name: str


class SkladOrder(BaseModel):
    positions: SkladApiListResponse[SkladPosition]
    project: Optional[SkladProject] = None
    name: str
    id: str
    meta: SkladBaseMetadata
    moment: Optional[str] = None
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
        items: Iterable[T], is_main_item: Callable[[T], bool], is_component: Callable[[T], bool]
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


# --- ОСНОВНАЯ ФУНКЦИЯ (переработана) ---
def generate_summary_report(product_names: list[str]):
    """
    Основная функция: ищет заказы для списка товаров, агрегирует данные
    и генерирует сводный Excel-отчет.
    """
    client = SkladClient()
    report_data = []

    for product_name in product_names:
        print(f"--- Обработка товара: {product_name} ---")
        product_list = client.get(
            f'entity/product?filter=name={product_name}',
            SkladApiListResponse[SkladProduct]
        )
        if not product_list.meta.size == 1:
            print(f"Найдено {product_list.meta.size} товаров с названием '{product_name}'. Требуется точное совпадение. Пропускаем.")
            continue

        product = product_list.rows[0]
        print(f"✅ Найден товар: {product.name} ({product.meta.href})")

        url_orders = "/entity/customerorder?expand=positions,positions.assortment,demands,demands.positions,project&limit=100"
        url_orders += f"&filter=assortment={product.meta.href}"
        orders_list = client.get(url_orders, SkladApiListResponse[SkladOrder])

        if not orders_list or orders_list.meta.size == 0:
            print("ℹ️ Заказы с этим товаром не найдены.")
            continue

        print(f"📊 Найдено заказов для анализа: {orders_list.meta.size}")

        # Определяем "условия" для группировки позиций
        is_target_product = lambda pos: pos.assortment.name == product_name
        is_fabric = lambda pos: pos.assortment.pathName in FABRIC_GROUPS
        is_target_product_in_demand = lambda d_pos: d_pos.assortment.meta.href == product.meta.href

        for order in orders_list.rows:
            print(f"   ...Обработка заказа №{order.name}")

            # 1. Первичная группировка позиций в заказе
            initial_groups = list(_group_positions_generator(order.positions.rows, is_target_product, is_fabric))

            # 2. АГРЕГАЦИЯ одинаковых позиций внутри заказа
            aggregated_positions = {}
            for group in initial_groups:
                key = (group.get_main_item_href(), group.get_component_hrefs())
                if key in aggregated_positions:
                    aggregated_positions[key].quantity += group.quantity  # Суммируем количество
                else:
                    aggregated_positions[key] = group  # Добавляем новую уникальную позицию

            # 3. Собираем и суммируем информацию по всем отгрузкам заказа
            shipped_quantities = collections.defaultdict(float)
            if order.demands:
                fabric_hrefs_in_order = {f.assortment.meta.href for f in order.positions.rows if
                                         f.assortment.pathName in FABRIC_GROUPS}
                is_fabric_in_demand = lambda d_pos: d_pos.assortment.meta.href in fabric_hrefs_in_order

                for demand in order.demands:
                    demand_groups = _group_positions_generator(
                        demand.positions.rows, is_target_product_in_demand, is_fabric_in_demand
                    )
                    for group in demand_groups:
                        key = (group.get_main_item_href(), group.get_component_hrefs())
                        shipped_quantities[key] += group.quantity

            # 4. Формируем строки для сводного отчета
            order_date = datetime.fromisoformat(order.moment.replace(" ", "T")).strftime("%Y-%m-%d") if order.moment else ""
            project_name = order.project.name if order.project else "Без проекта"

            for group in aggregated_positions.values():
                lookup_key = (group.get_main_item_href(), group.get_component_hrefs())
                total_shipped = shipped_quantities[lookup_key]

                report_data.append({
                    "Заказ": order.name,
                    "Проект": project_name,
                    "Дата заказа": order_date,
                    "Товар": group.main_item.name,
                    "Ткани": ", ".join(c.name for c in group.components) or "Без ткани",
                    "Заказано": group.quantity,
                    "Отгружено": total_shipped,
                    "Осталось отгрузить": group.quantity - total_shipped,
                })

    if not report_data:
        print("ℹ️ Нет данных для создания отчета.")
        return

    # 5. Создаем и сохраняем Excel-файл
    df = pd.DataFrame(report_data)
    column_order = [
        "Заказ", "Проект", "Дата заказа", "Товар", "Ткани",
        "Заказано", "Отгружено", "Осталось отгрузить"
    ]
    df = df[column_order]

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filename = f"MS_product_report_{timestamp}.xlsx"

    try:
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"\n🎉 Сводный отчет успешно сохранен в файл: {filename}")
    except Exception as e:
        print(f"\n❌ Не удалось сохранить отчет. Ошибка: {e}")


# --- ЗАПУСК ---
if __name__ == "__main__":
    target_products = [
        "Бокс / FP/ Изделие № 515 (05, 900*2000 мм)",
        "Бокс /FP/ Изделие №599_5959 (01, 900*2000 мм)",
        "Кроватный бокс / 1МФ / Изделие № 230 (01, 900х2000 мм)",
        "Спринг бокс (01, 900*2000 мм)",
        "Спринг бокс / 1МФ / Изделие №230 (11, 1900*900 мм)",
        "Спринг бокс 900*2000*h350 мм (высота борта 270 мм, ножка 80 мм)",
        "Спринг бокс (900х2000хh350) (опоры h15 см, массив бука)",
        "Спринг бокс /FP/ Изделие №609_6022 (04, 900*2000*200h)",
        "Спринг бокс /СЗМК/ Изделие №0051 (02, 900*2000*h350 мм) высота борта - 250 мм, ножка - 100 мм",
        "Спринг Бокс / ЧП / Изделие №91 (03, 900х2000 мм)",
        "Спринг Бокс / ЧП / Изделие №91 (03, 900х2000 мм)",
    ]
    generate_summary_report(target_products)