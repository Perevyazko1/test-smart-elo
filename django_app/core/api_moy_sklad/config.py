"""Статические настройки API backend`a"""
from django_app.settings import MEDIA_ROOT
import os


# Основной токен
TOKEN = 'b6cbd1444a9cf14ee0c03efa27933a6c9cbbed14'

SKLAD_URL = 'https://api.moysklad.ru'

# Базовый путь к запросам сущностей
BASE_URL = f'{SKLAD_URL}/api/remap/1.2/entity/'

# Header для GET запросов
GET_AUTH = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept-Encoding': 'gzip',
}

# Header для POST запросов
CONT_TYPE = {'Content-Type': 'application/json'}

# Header для POST запросов полный
POST_AUTH = {**GET_AUTH, **CONT_TYPE}

# Список целевых статусов для импорта заказов
ORDER_FILTER_LIST = [
    os.getenv('TARGET_API_STATUS', "Тест"),
    # 'state.name=В пр-ве | Ожидает',
    # 'state.name=В пр-ве | Пила / Пошив',
    # 'state.name=В пр-ве | Пила / Сшит',
    # 'state.name=В пр-ве | Собран / Пошив',
    # 'state.name=В пр-ве | Обивка',
]

# Подготовленный списки для expand в запросах для получения развернутых вложенных данных связанных моделей в сущностях
# Expand для заказов
ORDER_EXPAND = [
    'positions.assortment',
    'positions.assortment.product',
    'project'
]

# Expand для модификаций
VARIANT_EXPAND = [
    'product.images',
    'product.productFolder',
    'images'
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
    'Услуги/РЕКЛАМАЦИЯ',
]

# Список целевых групп попадающих под понятие Ткань для изделия
FABRIC_GROUPS = [
    'Материалы/Ткани',
]

# Общий список групп для загрузки товаров
TARGET_PRODUCT_GROUPS: list[str] = PRODUCT_GROUPS + FABRIC_GROUPS

DEFAULT_URGENCY_LEVEL = 3

IMAGE_FOLDER = os.path.join(MEDIA_ROOT + 'images')
