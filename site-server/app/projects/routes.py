from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.configs.api import PaginationBaseModel, pagination_params, PaginatedResponse, \
    fetch_paginated_data
from app.database.db import get_db_session
from app.projects.models import Project, ProjectImage
from app.projects.populate_projects import populate_projects
from app.projects.schemas import ProjectSchema, ProjectImageSchema

project_router = APIRouter()


@project_router.get("/", response_model=PaginatedResponse[ProjectSchema])
async def get_projects(
        pagination: PaginationBaseModel = Depends(pagination_params),
        db: AsyncSession = Depends(get_db_session)
):
    query = select(Project).options(joinedload(Project.images))
    items, total_count = await fetch_paginated_data(db, Project, query, pagination)

    return PaginatedResponse[ProjectSchema](
        data=items,
        limit=pagination.limit,
        offset=pagination.offset,
        total=total_count
    )


@project_router.get("/init")
async def init_projects():
    await populate_projects(10)
    return {"message": f"Inited"}


@project_router.get(
    "/{project_id}",
    response_model=ProjectSchema,
)
async def get_project(
        project_id: int,
        db: AsyncSession = Depends(get_db_session)
):
    query = select(Project).where(Project.id == project_id).options(joinedload(Project.images))

    result = await db.execute(query)
    project = result.unique().scalar_one_or_none()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectSchema.model_validate(project)


@project_router.get(
    "/{project_id}/images",
    response_model=PaginatedResponse[ProjectImageSchema],
)
async def get_project_images(
        project_id: int,
        pagination: PaginationBaseModel = Depends(pagination_params),
        db: AsyncSession = Depends(get_db_session)
):
    query = select(ProjectImage).where(ProjectImage.project_id == project_id)
    items, total_count = await fetch_paginated_data(db, Project, query, pagination)

    return PaginatedResponse[ProjectImageSchema](
        data=items,
        limit=pagination.limit,
        offset=pagination.offset,
        total=total_count
    )
