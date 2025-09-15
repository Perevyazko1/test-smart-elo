from typing import TypeVar, Generic, Optional

from pydantic import BaseModel

G = TypeVar('G')


class SkladListMetadata(BaseModel):
    href: str
    type: str
    mediaType: str
    size: int
    limit: int
    offset: int

    class Config:
        extra = "ignore"


class SkladListNoExpand(BaseModel):
    meta: SkladListMetadata

    class Config:
        extra = "ignore"


class SkladApiListResponse(BaseModel, Generic[G]):
    meta: SkladListMetadata
    rows: list[G]

    class Config:
        extra = "ignore"


class SkladBaseMetadata(BaseModel):
    href: str
    type: str
    mediaType: str

    class Config:
        extra = "ignore"


class SkladImageMetadata(SkladBaseMetadata):
    downloadHref: str


class SkladState(BaseModel):
    meta: SkladBaseMetadata
    id: str
    name: str


class SkladStatesResponse(BaseModel):
    states: list[SkladState]


class SkladImagesSchema(BaseModel):
    meta: SkladListMetadata


class ImageMetadata(BaseModel):
    downloadHref: str

    class Config:
        extra = "ignore"


class SkladAttribute(BaseModel):
    id: str
    name: str
    type: str
    value: Optional[str | bool | int | dict | list] = None

    class Config:
        extra = "ignore"



class SkladProject(BaseModel):
    id: str
    name: str

    class Config:
        extra = "ignore"


class SkladProductImage(BaseModel):
    filename: str
    meta: SkladImageMetadata
    miniature: SkladImageMetadata

    class Config:
        extra = "ignore"


class SkladBarcode(BaseModel):
    ean8:Optional[str] = None
    ean13:Optional[str] = None
    code128:Optional[str] = None
    gtin:Optional[str] = None
    upc:Optional[str] = None

    class Config:
        extra = "ignore"


class SkladProduct(BaseModel):
    id: str
    name: str
    pathName: Optional[str] = None
    updated: str
    images: Optional[SkladListNoExpand] = None
    attributes: Optional[list[SkladAttribute]] = None
    barcodes: Optional[list[SkladBarcode]] = None

    class Config:
        extra = "ignore"


class SkladStock(BaseModel):
    available: float
    cost: float
    intransit: float
    quantity: float
    reserve: float

    class Config:
        extra = "ignore"


class SkladPosition(BaseModel):
    id: str
    assortment: SkladProduct
    price: float
    quantity: float
    shipped: float
    stock: SkladStock

    class Config:
        extra = "ignore"


class SkladEmployee(BaseModel):
    id: str
    name: str
    firstName: str = None
    lastName: str = None
    middleName: str = None

    class Config:
        extra = "ignore"


class SkladAgent(BaseModel):
    id: str
    name: str
    tags: Optional[list[str]] = []

    class Config:
        extra = "ignore"


class SkladOrderExpandProjectPositionsAssortment(BaseModel):
    id: str
    name: str
    moment: str
    sum: int
    project: Optional[SkladProject] | None = None
    attributes: Optional[list[SkladAttribute]] = None
    positions: SkladApiListResponse[SkladPosition]

    updated: str
    owner: SkladEmployee
    agent: SkladAgent

    class Config:
        extra = "ignore"
