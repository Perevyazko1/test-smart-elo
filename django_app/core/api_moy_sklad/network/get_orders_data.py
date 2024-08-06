import json

from ..config import BASE_URL, ORDER_FILTER_LIST, ORDER_EXPAND
from ..services.solid_requests import solid_get_request


class GetOrdersData:
    def __init__(self,
                 order_base_url: str = BASE_URL + "customerorder",
                 order_filter: list = ORDER_FILTER_LIST,
                 order_expand: list = ORDER_EXPAND):
        self.order_filter = order_filter
        self.order_expand = order_expand
        self.order_base_url = order_base_url
        self.limit = 100

    def _make_order_filter(self) -> str:
        result = ''
        if self.order_filter:
            result += 'filter=' + ';'.join(map(str, self.order_filter))
        return result

    def _make_order_expand(self, offset=0) -> str:
        result = ''
        if self.order_expand:
            result += 'expand=' + ', '.join(map(str, self.order_expand)) + f'&limit={self.limit}&offset={offset}'
        return result

    def _get_order_url(self, offset=0) -> str:
        return self.order_base_url + "?" + self._make_order_expand(offset) + "&" + self._make_order_filter()

    def _fetch_orders(self, offset=0) -> dict:
        req = solid_get_request(self._get_order_url(offset))
        return json.loads(req.text)

    def execute(self) -> dict:
        all_orders = []
        offset = 0
        while True:
            order_data = self._fetch_orders(offset)
            all_orders.extend(order_data.get('rows', []))
            if len(all_orders) >= order_data['meta']['size']:
                break
            offset += self.limit

        return {'meta': order_data['meta'], 'rows': all_orders}
