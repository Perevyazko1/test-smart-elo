from sqladmin import ModelView

from app.permissions.models import Permission, Role, UserRole


class PermissionAdmin(ModelView, model=Permission):
    column_list = [
        Permission.id,
        Permission.resource,
        Permission.action,
        Permission.attributes,
    ]


class RoleAdmin(ModelView, model=Role):
    column_list = [
        Role.id,
        Role.name,
        Role.is_active,
        Role.description,
    ]


class UserRoleAdmin(ModelView, model=UserRole):
    column_list = [
        UserRole.id,
        UserRole.role,
        UserRole.user,
    ]
