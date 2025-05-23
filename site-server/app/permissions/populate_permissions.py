from faker import Faker
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import connection
from app.permissions.models import Permission, Role

fake = Faker('ru_RU')


@connection
async def create_permissions(session: AsyncSession):
    permissions_data = [
        {'resource': 'user', 'action': 'view'},
        {'resource': 'user', 'action': 'create'},
        {'resource': 'user', 'action': 'update'},
        {'resource': 'user', 'action': 'delete'},
        # Добавьте другие разрешения по необходимости
    ]
    permissions = []
    for perm in permissions_data:
        permission = Permission(
            resource=perm['resource'],
            action=perm['action']
        )
        session.add(permission)
        permissions.append(permission)
    await session.commit()
    print("Permissions created.")
    return permissions


@connection
async def create_roles(session: AsyncSession):
    result = await session.execute(select(Permission))
    permissions = result.scalars().all()
    permissions_dict = {(perm.resource, perm.action): perm for perm in permissions}

    roles_data = [
        {
            'name': 'admin',
            'description': 'Administrator with full access',
            'permissions': permissions
        },
        {
            'name': 'editor',
            'description': 'Can edit content',
            'permissions': [
                permissions_dict.get(('user', 'view')),
                permissions_dict.get(('user', 'update')),
            ]
        },
        {
            'name': 'viewer',
            'description': 'Can only view content',
            'permissions': [
                permissions_dict.get(('user', 'view')),
            ]
        }
    ]

    roles = []
    for role_data in roles_data:
        role = Role(
            name=role_data['name'],
            description=role_data['description'],
            is_active=True,
            permissions=role_data['permissions']
        )
        session.add(role)
        roles.append(role)
    await session.commit()
    print("Roles created.")
    return roles
