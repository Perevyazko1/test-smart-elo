from sqladmin.authentication import AuthenticationBackend
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from starlette.responses import RedirectResponse
from starlette.templating import Jinja2Templates
from sqlalchemy.future import select

from app.users.models import User
from app.database.db import connection

templates = Jinja2Templates(directory="templates")


class SQLAdminAuthentication(AuthenticationBackend):
    @staticmethod
    @connection
    async def get_user(session: AsyncSession, email, password) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        print(f'###PRINT get_user #l=>21:', user)
        print(f'###PRINT get_user #l=>22:', password, user.check_password(password))
        if user and user.check_password(password):
            return user
        return None

    async def login(self, request: Request):
        if request.method == "GET":
            return templates.TemplateResponse("login.html", {"request": request})

        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        user = await self.get_user(username, password)
        print(f'###PRINT login #l=>37:', user, user.id)

        if user:
            request.session.update({"user_id": user.id})
            return RedirectResponse(request.url_for("admin:index"), status_code=302)

        return templates.TemplateResponse("login.html", {"request": request, "error": "Неверные учетные данные"})

    async def logout(self, request: Request):
        request.session.clear()
        return RedirectResponse(request.url_for("admin:login"), status_code=302)

    async def authenticate(self, request: Request):
        user_id = request.session.get("user_id")
        if user_id:
            return True
        return False
