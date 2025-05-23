import os

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.admin import setup_admin
from app.routes import app_router
from app.settings import settings

SECRET_KEY = 'fast-secure-q)a(9s&8#-r$@i_82nqyi6sbjzre5l+w4qflnm^=9%-3cynp#$'

# noinspection PyTypeChecker
middleware = [
    Middleware(CORSMiddleware, allow_origins=['*']),
    Middleware(SessionMiddleware, secret_key=SECRET_KEY),
]

app = FastAPI(middleware=middleware)
admin = setup_admin(app, SECRET_KEY)
app.include_router(app_router, prefix=f'{settings.API_URL}')

app.mount(
    settings.media_url,
    StaticFiles(directory=settings.media_path),
    name="media"
)

@app.get("/api/media/{path:path}")
async def get_media(path: str):
    file_path = os.path.join(settings.media_path, path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@app.get("/")
async def root():
    return {"message": "server connected..."}
