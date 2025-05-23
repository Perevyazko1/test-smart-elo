from sqladmin import Admin
from app.authentication import SQLAdminAuthentication
from app.database.db import engine
from app.permissions.admin import PermissionAdmin, RoleAdmin, UserRoleAdmin
from app.users.admin import UserAdmin
from app.projects.admin import ProjectAdmin, ProjectImageAdmin, FileUploadAdminView
from app.settings import settings


def setup_admin(app, secret_key):
    admin = Admin(
        app,
        engine,
        authentication_backend=SQLAdminAuthentication(
            secret_key
        ),
        base_url=settings.ADMIN_URL,
    )
    admin.add_view(UserAdmin)
    admin.add_view(PermissionAdmin)
    admin.add_view(RoleAdmin)
    admin.add_view(UserRoleAdmin)
    admin.add_view(ProjectAdmin)
    admin.add_view(ProjectImageAdmin)
    admin.add_view(FileUploadAdminView)
    return admin
