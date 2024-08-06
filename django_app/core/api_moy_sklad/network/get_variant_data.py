import json

from ..config import VARIANT_EXPAND, BASE_URL
from ..services.solid_requests import solid_get_request


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
        req = solid_get_request(self._get_variant_url(variant_id))
        return json.loads(req.text)
