from collections import defaultdict
from pprint import pprint
from typing import Dict, Any

from django.http import JsonResponse
from rest_framework.decorators import api_view

from core.models import FabricPicture
from src.api.sklad_client import SkladClient
from src.api.sklad_schemas import SkladApiListResponse, SkladPurchaseOrder, SkladProduct

# Константы для работы с МойСклад
FABRIC_GROUP = "https://api.moysklad.ru/api/remap/1.2/entity/productFolder/7ab08c73-6e0e-11ec-0a80-09e500795192"
TARGET_ATTRIBUTE = 'https://api.moysklad.ru/api/remap/1.2/entity/product/metadata/attributes/fbce37d6-cc0a-11ef-0a80-14570049bee1'
FABRIC_GROUP_ID = "7ab08c73-6e0e-11ec-0a80-09e500795192"
FABRIC_PATH_NAME = "Закупка материалов (для производства, составляющие изделия)/Ткани"
STORE_NAME = "К.Тракт фабрика"
ORGANISATION_NAME = 'ООО "СЗМК"'
START_DATE = "2026-02-01 00:00:00"
LIMIT = 100


def _fetch_all_items(client: SkladClient, endpoint: str, response_type, params: dict):
    """Получить все элементы списка с учетом пагинации."""
    all_rows = []
    offset = 0

    while True:
        params["offset"] = str(offset)
        result = client.get(endpoint, response_type=response_type, params=params)

        all_rows.extend(result.rows)

        # Если получили все элементы, выходим
        if offset + len(result.rows) >= result.meta.size:
            break

        offset += LIMIT

    return all_rows


def _get_fabric_image_url(product_id: str) -> str | None:
    """Получить URL изображения ткани по ID продукта."""
    fabric = FabricPicture.objects.filter(fabric__fabric_id=product_id).first()
    return fabric.image.url if fabric and fabric.image else None


def _is_fabric_product(product) -> bool:
    """Проверить, что товар относится к группе ткани."""
    return hasattr(product, 'pathName') and product.pathName == FABRIC_PATH_NAME


def _create_fabric_card_template() -> Dict[str, Any]:
    """Создать шаблон данных для карточки ткани."""
    return {
        "product_id": "",
        "name": "",
        "order": "",
        "quantity": 0.0,
        "shipped": 0.0,
        "stock": 0.0,
        "image": None,
        "agent": "",
        "project": "",
        "payed": "",
    }


@api_view(['GET'])
def get_purchaseorders(request):
    """Получить заказы поставщикам с тканями."""
    client = SkladClient()

    # Формируем фильтр по статусам заказов
    states = [
        "Новый",
        "Согласование",
        "Счет / Оплата",
        "Оплачен / Не отгружен",
        "Отгружен / Не оплачен",
        "Ожидание готовности",
        "В доставке",
    ]
    state_filters = ";".join(f"state.name={state}" for state in states)
    filters = f"{state_filters};created>={START_DATE}"

    orders = _fetch_all_items(
        client,
        "entity/purchaseorder",
        SkladApiListResponse[SkladPurchaseOrder],
        {
            "filter": filters,
            "expand": "positions.assortment,project,agent",
            "limit": LIMIT,
            "fields": "stock",
        }
    )

    # Группируем позиции по товарам из группы ткани
    fabric_data = defaultdict(_create_fabric_card_template)

    for order in orders:
        for position in order.positions.rows:
            product = position.assortment

            if _is_fabric_product(product) and not position.quantity == position.shipped:
                product_data = fabric_data[product.id]
                product_data["product_id"] = product.id
                product_data["order_id"] = order.id
                product_data["name"] = product.name
                product_data["quantity"] += position.quantity
                product_data["shipped"] += position.shipped
                product_data["payed"] = (order.payedSum == order.sum and order.sum > 0)
                product_data["order"] = order.name
                product_data["project"] = order.project.name if order.project else ""
                product_data["agent"] = order.agent.name if order.agent else ""
                product_data["moment"] = order.moment
                product_data["stock"] = position.stock.quantity
                product_data["image"] = _get_fabric_image_url(product.id)

    return JsonResponse({"fabric_cards": fabric_data}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_assortment(request):
    """Получить ассортимент тканей на складе."""
    client = SkladClient()
    filters = f"stockMode=positiveOnly;productFolder={FABRIC_GROUP};{TARGET_ATTRIBUTE}=true"

    products = _fetch_all_items(
        client,
        "entity/assortment",
        SkladApiListResponse[SkladProduct],
        {
            "filter": filters,
            "limit": LIMIT,
            "fields": "stock",
        }
    )

    fabric_data = defaultdict(lambda: {
        "product_id": "",
        "name": "",
        "order": "",
        "quantity": 0.0,
        "shipped": 0.0,
        "stock": 0.0,
        "image": None,
    })

    for product in products:
        product_data = fabric_data[product.id]
        product_data["product_id"] = product.id
        product_data["name"] = product.name
        product_data["stock"] = product.stock
        product_data["image"] = _get_fabric_image_url(product.id)

    return JsonResponse({"fabric_cards": fabric_data}, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_supply(request):
    """Получить приемки тканей."""
    client = SkladClient()
    filters = f"assortment={FABRIC_GROUP};created>={START_DATE}"

    supplies = _fetch_all_items(
        client,
        "entity/supply",
        SkladApiListResponse[SkladPurchaseOrder],
        {
            "filter": filters,
            "expand": "positions.assortment,project,agent",
            "limit": LIMIT,
            "fields": "stock",
        }
    )

    # Группируем позиции по товарам из группы ткани
    fabric_data = defaultdict(lambda: {
        "product_id": "",
        "name": "",
        "moment": "",
        "order": "",
        "project": "",
        "quantity": 0.0,
        "shipped": 0.0,
        "stock": 0.0,
        "image": None,
    })

    for order in supplies:
        for position in order.positions.rows:
            product = position.assortment

            if _is_fabric_product(product):
                product_data = fabric_data[product.id]
                product_data["product_id"] = product.id
                product_data["order_id"] = order.id
                product_data["name"] = product.name
                product_data["quantity"] += position.quantity
                product_data["order"] = order.name
                product_data["stock"] = position.stock.quantity
                product_data["project"] = order.project.name if order.project else ""
                product_data["moment"] = order.moment
                product_data["image"] = _get_fabric_image_url(product.id)

    return JsonResponse({"fabric_cards": fabric_data}, json_dumps_params={"ensure_ascii": False})


def _find_entity_meta(client: SkladClient, entity_type: str, entity_name: str) -> Dict[str, Any]:
    """Найти meta объект по имени сущности."""
    entities = client.get(f"entity/{entity_type}")
    for entity in entities['rows']:
        if entity['name'] == entity_name:
            return entity['meta']
    return {}


@api_view(['POST'])
def create_loss(request):
    """Создать документ списания ткани."""
    fabric_id = request.data.get('fabric_id')
    quantity = request.data.get('quantity')

    if not fabric_id or not quantity:
        return JsonResponse(
            {"error": "fabric_id и quantity обязательны"},
            status=400,
            json_dumps_params={"ensure_ascii": False}
        )

    client = SkladClient()

    # Получаем мета-данные организации и склада
    organisation_meta = _find_entity_meta(client, "organization", ORGANISATION_NAME)
    store_meta = _find_entity_meta(client, "store", STORE_NAME)

    # Получаем мета-данные продукта
    product = client.get(f"entity/product/{fabric_id}")
    product_meta = product['meta']

    # Создаем документ списания
    client.post('entity/loss', {
        "store": {"meta": store_meta},
        "organization": {"meta": organisation_meta},
        "positions": [
            {
                "quantity": quantity,
                "assortment": {"meta": product_meta}
            }
        ],
    })

    return JsonResponse({"result": "OK"}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def create_supply(request):
    fabric_id = request.data.get('fabric_id')
    quantity = request.data.get('quantity')
    order_id = request.data.get('order_id')

    client = SkladClient()

    purchaseorder = client.get(
        f"entity/purchaseorder/{order_id}",
        SkladPurchaseOrder,
        params={
            "expand": "positions.assortment,project,agent",
            "fields": "stock",
        },
    )

    price = 0

    for position in purchaseorder.positions.rows:
        if position.assortment.id == fabric_id:
            price = position.price
            break

    fabric = client.get(
        f"entity/product/{fabric_id}",
        SkladProduct,
        params={
            "fields": "stock",
        },
    )

    client.post('entity/supply/', {
        "positions": [
            {
                "quantity": quantity,
                "assortment": {"meta": fabric.meta.model_dump()},
                "price": price,
            }
        ],
        "purchaseOrder": {
            "meta": purchaseorder.meta.model_dump(),
        },
        "agent": {
            "meta": purchaseorder.agent.meta.model_dump(),
        },
        "organization": {
            "meta": purchaseorder.organization.meta.model_dump(),
        },
        "store": {
            "meta": purchaseorder.store.meta.model_dump(),
        },
    })

    return JsonResponse(
        {"result": "OK"},
        json_dumps_params={"ensure_ascii": False}
    )



@api_view(['GET'])
def test(request):
    client = SkladClient()

    # Формируем фильтр по статусам заказов
    states = [
        "Новый",
        "Согласование",
        "Счет / Оплата",
        "Оплачен / Не отгружен",
        "Отгружен / Не оплачен",
        "Ожидание готовности",
        "В доставке",
    ]
    state_filters = ";".join(f"state.name={state}" for state in states)
    filters = f"{state_filters};created>={START_DATE}"

    result = client.get(
        "entity/purchaseorder",
        params={
            "filter": filters,
            "expand": "positions.assortment,project,agent",
            "limit": LIMIT,
            "offset": "0",
            "fields": "stock",
        }
    )

    pprint(result["rows"])

    return JsonResponse(
        {"result": result["meta"]},
        json_dumps_params={"ensure_ascii": False}
    )
