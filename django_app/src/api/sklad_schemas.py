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
    archived: bool
    stock: Optional[float] = None
    images: Optional[SkladListNoExpand] = None
    attributes: Optional[list[SkladAttribute]] = None
    barcodes: Optional[list[SkladBarcode]] = None
    meta: SkladBaseMetadata

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


class SkladPositionAssortment(BaseModel):
    """Assortment может быть либо полным объектом (с expand), либо только meta"""
    meta: Optional[SkladBaseMetadata] = None
    id: Optional[str] = None
    name: Optional[str] = None
    pathName: Optional[str] = None
    updated: Optional[str] = None
    archived: Optional[bool] = None
    stock: Optional[float] = None
    images: Optional[SkladListNoExpand] = None
    attributes: Optional[list[SkladAttribute]] = None
    barcodes: Optional[list[SkladBarcode]] = None

    class Config:
        extra = "ignore"


class SkladPosition(BaseModel):
    id: str
    assortment: SkladPositionAssortment
    price: float
    quantity: float
    shipped: Optional[float] = None
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
    """Agent может быть либо полным объектом (с expand), либо только meta"""
    meta: Optional[SkladBaseMetadata] = None
    id: Optional[str] = None
    name: Optional[str] = None
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


class SkladOrganization(BaseModel):
    meta: SkladBaseMetadata


class SkladStore(BaseModel):
    meta: SkladBaseMetadata


class SkladPurchaseOrder(BaseModel):
    id: str
    name: str
    moment: str
    positions: SkladApiListResponse[SkladPosition]
    project: Optional[SkladProject] | None = None
    agent: SkladAgent
    organization: SkladOrganization
    meta: SkladBaseMetadata
    store: Optional[SkladStore] | None = None
    payedSum: float
    sum: float


    class Config:
        extra = "ignore"
