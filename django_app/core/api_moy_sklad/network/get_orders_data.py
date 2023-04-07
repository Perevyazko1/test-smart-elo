import requests
import json

from ..config import GET_AUTH, BASE_URL, ORDER_FILTER_LIST, ORDER_EXPAND


class GetOrdersData:
    def __init__(self,
                 order_base_url: str = BASE_URL + "customerorder",
                 order_filter: list = ORDER_FILTER_LIST,
                 order_expand: list = ORDER_EXPAND):
        self.order_filter = order_filter
        self.order_expand = order_expand
        self.order_base_url = order_base_url

    def _make_order_filter(self) -> str:
        result = ''
        if self.order_filter:
            result += 'filter=' + ';'.join(map(str, self.order_filter))
        return result

    def _make_order_expand(self) -> str:
        result = ''
        if self.order_expand:
            result += 'expand=' + ', '.join(map(str, self.order_expand)) + '&limit=100'
        return result

    def _get_order_url(self) -> str:
        return self.order_base_url + "?" + self._make_order_expand() + "&" + self._make_order_filter()

    def execute(self) -> dict:
        req = requests.get(self._get_order_url(), headers=GET_AUTH)
        return json.loads(req.text)
