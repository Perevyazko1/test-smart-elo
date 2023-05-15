import json
import requests

from core.api_moy_sklad.config import BASE_URL, POST_AUTH
from core.api_moy_sklad.metadata import READY_ORDER_METADATA


def change_order_status(order_id: str):
    url = BASE_URL + 'customerorder/' + order_id
    data = {
        "state": {
            "meta": READY_ORDER_METADATA
        }
    }
    req = requests.put(url, headers=POST_AUTH, data=json.dumps(data))

    return json.loads(req.text)
