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


class SkladProduct(BaseModel):
    id: str
    name: str
    pathName: str
    updated: str
    images: Optional[SkladListNoExpand] = None

    class Config:
        extra = "ignore"


class SkladPosition(BaseModel):
    id: str
    assortment: SkladProduct
    price: int
    quantity: float

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

    class Config:
        extra = "ignore"
