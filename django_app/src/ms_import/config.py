import os
from django_app.settings import MEDIA_ROOT


# Список целевых статусов для импорта заказов
ORDER_FILTER_LIST = [
    os.getenv('TARGET_API_STATUS', "Тест"),
]

# Expand для заказов
ORDER_EXPAND = [
    'positions.assortment',
    'positions.assortment.product',
    'project',
    'owner',
    'agent',
]

# Expand для товаров
PRODUCT_EXPAND = [
    'images',
    'productFolder'
]


# Список целевых групп товаров попадающих под понятие Изделие
PRODUCT_GROUPS = [
    'Мебель и готовые изделия/Випы',
    'Мебель и готовые изделия/Мебель "Серийная"',
    'Мебель и готовые изделия/Подушки декоративные',
    'Мебель и готовые изделия/Прочее',
    'Мебель и готовые изделия/РЕКЛАМАЦИЯ',
]

# Список целевых групп попадающих под понятие Ткань для изделия
FABRIC_GROUPS = [
    'Закупка материалов (для производства, составляющие изделия)/Ткани',
]

# Общий список групп для загрузки товаров
TARGET_PRODUCT_GROUPS: list[str] = PRODUCT_GROUPS + FABRIC_GROUPS

DEFAULT_URGENCY_LEVEL = 3

IMAGE_FOLDER = os.path.join(MEDIA_ROOT + 'images')
