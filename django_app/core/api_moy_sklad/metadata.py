from core.api_moy_sklad.config import BASE_URL, SKLAD_URL

META_UL_SZMK = {
    "href": f"{BASE_URL}organization/4212c358-d9b2-11e8-9ff4-34e8000bf356",
    "mediaType": "application/json",
    "metadataHref": f"{BASE_URL}organization/metadata",
    "type": "organization",
    "uuidHref": f"{SKLAD_URL}/app/#mycompany/edit?id=4212c358-d9b2-11e8-9ff4-34e8000bf356"
}

META_UL_SZMK_PLUS = {
    "href": f"{BASE_URL}organization/d0a74928-ea48-11e8-9ff4-34e8000d787e",
    "mediaType": "application/json",
    "metadataHref": f"{BASE_URL}organization/metadata",
    "type": "organization",
    "uuidHref": f"{SKLAD_URL}/app/#mycompany/edit?id=d0a74928-ea48-11e8-9ff4-34e8000d787e"
}

STORE_K_TRAKT_FABRIKA = {
    "href": f"{BASE_URL}store/42143207-d9b2-11e8-9ff4-34e8000bf358",
    "mediaType": "application/json",
    "metadataHref": f"{BASE_URL}entity/store/metadata",
    "type": "store",
    "uuidHref": f"{SKLAD_URL}/app/#warehouse/edit?id=42143207-d9b2-11e8-9ff4-34e8000bf358"
}

META_PRODUCT = {
    "href": f"{BASE_URL}product/328b0454-2e62-11e6-8a84-bae500000118",
    "metadataHref": f"{BASE_URL}entity/product/metadata",
    "type": "product",
    "mediaType": "application/json"
}

META_VARIANT = {
    "href": f"{BASE_URL}variant/7a81082f-3c64-11e6-8a84-bae50000000e",
    "metadataHref": f"{BASE_URL}variant/metadata",
    "type": "variant",
    "mediaType": "application/json"
}

READY_ORDER_METADATA = {
    "href": f"{BASE_URL}customerorder/metadata/states/5000456a-7921-11ec-0a80-0f27000e1c3b",
    "mediaType": "application/json",
    "metadataHref": f"{BASE_URL}customerorder/metadata",
    "type": "state"
}


def get_product_meta(product_id: str) -> dict:
    return {
        "href": f"{BASE_URL}product/{product_id}",
        "metadataHref": f"{BASE_URL}product/metadata",
        "type": "product",
        "mediaType": "application/json"
    }


def get_variant_meta(variant_id: str) -> dict:
    return {
        "href": f"{BASE_URL}variant/{variant_id}",
        "metadataHref": f"{BASE_URL}variant/metadata",
        "type": "variant",
        "mediaType": "application/json"
    }
