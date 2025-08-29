from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladApiListResponse, SkladOrderExpandProjectPositionsAssortment
from src.ms_import.config import ORDER_FILTER_LIST, ORDER_EXPAND


def _fetch_orders(offset=0):
    client = SkladClient()

    params = {
        "filter": ';'.join(map(str, ORDER_FILTER_LIST)),
        "expand": ','.join(map(str, ORDER_EXPAND)),
        "limit": 100,
        "offset": offset,
        "fields": "stock",
    }

    order_list = client.get(
        "entity/customerorder",
        SkladApiListResponse[SkladOrderExpandProjectPositionsAssortment],
        params=params
    )
    return order_list


def get_ms_orders() -> list[SkladOrderExpandProjectPositionsAssortment]:
    offset = 0
    limit = 100
    all_orders = []

    while True:
        order_data = _fetch_orders(offset)
        all_orders.extend(order_data.rows)
        if len(all_orders) >= order_data.meta.size:
            break
        offset += limit

    return all_orders
