import json
import requests

from ..config import GET_AUTH, PRODUCT_EXPAND, BASE_URL


class GetProductData:
    def __init__(self, product_expand: list = PRODUCT_EXPAND, product_base_url: str = BASE_URL + "product"):
        self.product_expand = product_expand
        self.product_base_url = product_base_url

    def _make_product_expand(self):
        result = ''
        if self.product_expand:
            result += 'expand=' + ', '.join(map(str, self.product_expand))
        return result

    def _get_product_url(self, product_id: str):
        return self.product_base_url + "/" + product_id + "?" + self._make_product_expand()

    def execute(self, product_id: str):
        req = requests.get(self._get_product_url(product_id), headers=GET_AUTH)
        return json.loads(req.text)
