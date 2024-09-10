import json
import requests

from core.api_moy_sklad.config import BASE_URL, POST_AUTH


def set_eq_link_in_order(order_id: str, current_link: str, order_db_id: int):
    """Формируем ссылку на заказ в системе. """
    elo_link = f"https://elo.szmk.pro/orders/{order_db_id}"

    """Сверяем с актуальной ссылкой в заказе и если она не соответствует - устанавливаем новую. """
    if current_link != elo_link:
        url = BASE_URL + 'customerorder/' + order_id

        data = {
            "attributes": [
                {
                    "meta": {
                        "href": "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/attributes/90b92313-1cb9-11ee-0a80-08bf000d91ed",
                        "type": "attributemetadata",
                        "mediaType": "application/json"
                    },
                    "id": "90b92313-1cb9-11ee-0a80-08bf000d91ed",
                    "name": "Ссылка на спец-ю:",
                    "type": "link",
                    "value": elo_link
                }
            ]
        }
        req = requests.put(url, headers=POST_AUTH, data=json.dumps(data))

        return json.loads(req.text)
