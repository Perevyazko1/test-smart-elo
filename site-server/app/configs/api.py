from pydantic import BaseModel
from typing import Optional, TypeVar, Generic, List, Tuple, Type, Sequence

from fastapi import Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from app.database.base import Base


class PaginationBaseModel(BaseModel):
    limit: Optional[int] = None
    offset: Optional[int] = None

    class Config:
        from_attributes = True


def pagination_params(
        limit: Optional[int] = Query(
            None,
            ge=1,
            le=100,
            description="Maximum number of items to return (1–100)."
        ),
        offset: Optional[int] = Query(
            None,
            ge=0,
            description="Number of items to skip."
        ),
):
    return PaginationBaseModel(limit=limit, offset=offset)


T = TypeVar("T", bound=Select)


def apply_pagination(query: T, pagination: PaginationBaseModel) -> T:
    if pagination.offset is not None:
        query = query.offset(pagination.offset)
    if pagination.limit is not None:
        query = query.limit(pagination.limit)

    return query


G = TypeVar('G')


class PaginatedResponse(PaginationBaseModel, Generic[G]):
    data: List[G]
    total: Optional[int] = None


ModelType = TypeVar("ModelType", bound=Base)


async def fetch_paginated_data(
    db: AsyncSession,
    model: Type[ModelType],
    query: T,
    pagination
) -> Tuple[Sequence[ModelType], int]:
    total_query = select(func.count(model.id))
    total_result = await db.execute(total_query)
    total_count = total_result.scalar()

    query = apply_pagination(query, pagination)

    result = await db.execute(query)
    items = result.scalars().unique().all()

    return items, total_count
