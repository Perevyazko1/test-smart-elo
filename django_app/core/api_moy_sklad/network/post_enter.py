import json
import requests

from ..metadata import META_UL_SZMK, STORE_K_TRAKT_FABRIKA, get_product_meta, get_variant_meta
from ..config import POST_AUTH
from ...models import Product


class CreateEnterDocument:
    @staticmethod
    def execute(product: Product, quantity: int):

        if product.type == "product":
            product_meta = get_product_meta(product.product_id)
        else:
            product_meta = get_variant_meta(product.product_id)

        # TODO сделать обработку неудачного пост запроса
        return requests.post(
            "https://online.moysklad.ru/api/remap/1.2/entity/enter",
            headers=POST_AUTH,
            data=json.dumps(
                {
                    "applicable": True,
                    "organization": {
                        "meta": META_UL_SZMK
                    },
                    "store": {
                        "meta": STORE_K_TRAKT_FABRIKA
                    },
                    "positions": [
                        {
                            "quantity": quantity,
                            "assortment": {
                                "meta": product_meta
                            },
                        },
                    ],
                }
            )
        )
