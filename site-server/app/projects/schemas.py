from typing import Optional, Sequence, List

from pydantic import BaseModel


class ProjectImageSchema(BaseModel):
    id: int
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

    description: Optional[str]
    is_published: bool
    is_preview: bool

    class Config:
        from_attributes = True


class ProjectImageListSchema(BaseModel):
    data: List[ProjectImageSchema]

    class Config:
        from_attributes = True


class ProjectSchema(BaseModel):
    id: int
    name: Optional[str]
    about: Optional[str]
    public: Optional[bool]
    preview_image: Optional[ProjectImageSchema] = None

    class Config:
        from_attributes = True
