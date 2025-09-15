"""Initial methods and scripts."""
import logging
from pprint import pprint

from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladApiListResponse, SkladOrderExpandProjectPositionsAssortment
from src.ms_import.config import ORDER_EXPAND

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    client = SkladClient()

    params = {
        "expand": ','.join(map(str, ORDER_EXPAND)),
        "limit": 1,
        "offset": 0,
        "fields": "stock",
    }

    order_list = client.get(
        "entity/customerorder",
        SkladApiListResponse[SkladOrderExpandProjectPositionsAssortment],
        params=params
    )

    pprint(order_list.model_dump())

    print('PASS')
    return f"Oki"
