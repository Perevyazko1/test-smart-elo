import json
import requests

from ..config import GET_AUTH, VARIANT_EXPAND, BASE_URL


class GetVariantData:
    def __init__(self, variant_expand: list = VARIANT_EXPAND, variant_base_url: str = BASE_URL + "variant"):
        self.variant_expand = variant_expand
        self.variant_base_url = variant_base_url

    def _make_variant_expand(self):
        result = ''
        if self.variant_expand:
            result += 'expand=' + ', '.join(map(str, self.variant_expand))
        return result

    def _get_variant_url(self, variant_id: str):
        return self.variant_base_url + "/" + variant_id + "?" + self._make_variant_expand()

    def execute(self, variant_id: str):
        req = requests.get(self._get_variant_url(variant_id), headers=GET_AUTH)
        return json.loads(req.text)
