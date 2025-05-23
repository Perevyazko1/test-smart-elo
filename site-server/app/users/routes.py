from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.configs.api import PaginationBaseModel, pagination_params, PaginatedResponse, fetch_paginated_data
from app.database.db import get_db_session
from app.permissions.populate_permissions import create_permissions, create_roles
from app.users.models import User
from app.users.populate_users import populate_users
from app.users.schemas import UserSchema


user_router = APIRouter()


@user_router.get("/", response_model=PaginatedResponse[UserSchema])
async def get_users(
    pagination: PaginationBaseModel = Depends(pagination_params),
    db: AsyncSession = Depends(get_db_session)
):
    query = select(User)
    items, total_count = await fetch_paginated_data(db, User, query, pagination)

    return PaginatedResponse[UserSchema](
        data=items,
        limit=pagination.limit,
        offset=pagination.offset,
        total=total_count,
    )


@user_router.get("/init")
async def init_users():
    await create_permissions()
    await create_roles()
    await populate_users(25)
    return {"message": f"Inited"}
