from fastapi import APIRouter

from app.projects.routes import project_router
from app.users.routes import user_router


app_router = APIRouter()
app_router.include_router(user_router, prefix=f'/users')
app_router.include_router(project_router, prefix=f'/projects')
