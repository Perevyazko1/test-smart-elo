META_UL_SZMK = {
    "href": "https://online.moysklad.ru/api/remap/1.2/entity/organization/4212c358-d9b2-11e8-9ff4-34e8000bf356",
    "mediaType": "application/json",
    "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/organization/metadata",
    "type": "organization",
    "uuidHref": "https://online.moysklad.ru/app/#mycompany/edit?id=4212c358-d9b2-11e8-9ff4-34e8000bf356"
}

META_UL_SZMK_PLUS = {
    "href": "https://online.moysklad.ru/api/remap/1.2/entity/organization/d0a74928-ea48-11e8-9ff4-34e8000d787e",
    "mediaType": "application/json",
    "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/organization/metadata",
    "type": "organization",
    "uuidHref": "https://online.moysklad.ru/app/#mycompany/edit?id=d0a74928-ea48-11e8-9ff4-34e8000d787e"
}

STORE_K_TRAKT_FABRIKA = {
    "href": "https://online.moysklad.ru/api/remap/1.2/entity/store/42143207-d9b2-11e8-9ff4-34e8000bf358",
    "mediaType": "application/json",
    "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/store/metadata",
    "type": "store",
    "uuidHref": "https://online.moysklad.ru/app/#warehouse/edit?id=42143207-d9b2-11e8-9ff4-34e8000bf358"
}

META_PRODUCT = {
    "href": "https://online.moysklad.ru/api/remap/1.2/entity/product/328b0454-2e62-11e6-8a84-bae500000118",
    "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/product/metadata",
    "type": "product",
    "mediaType": "application/json"
}

META_VARIANT = {
    "href": "https://online.moysklad.ru/api/remap/1.2/entity/variant/7a81082f-3c64-11e6-8a84-bae50000000e",
    "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/variant/metadata",
    "type": "variant",
    "mediaType": "application/json"
}


def get_product_meta(product_id: str) -> dict:
    return {
        "href": f"https://online.moysklad.ru/api/remap/1.2/entity/product/{product_id}",
        "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/product/metadata",
        "type": "product",
        "mediaType": "application/json"
    }


def get_variant_meta(variant_id: str) -> dict:
    return {
        "href": f"https://online.moysklad.ru/api/remap/1.2/entity/variant/{variant_id}",
        "metadataHref": "https://online.moysklad.ru/api/remap/1.2/entity/variant/metadata",
        "type": "variant",
        "mediaType": "application/json"
    }
