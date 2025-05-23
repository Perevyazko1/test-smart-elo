from faker import Faker
from faker.generator import random
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import connection
from app.permissions.models import Role, UserRole
from app.users.models import User

fake = Faker('ru_RU')


@connection
async def create_superuser(session: AsyncSession, email: str, password: str):
    result = await session.execute(select(User).where(User.email == email))
    existing_user = result.scalars().first()
    if existing_user:
        print(f"User with email {email} already exists.")
        return existing_user

    user = User()
    user.first_name = "Admin"
    user.last_name = "SZMK"
    user.patronymic = None
    user.email = email
    user.email_confirmed = True
    user.phone_number = None
    user.registered_at = fake.date_time_between(start_date='-1y', end_date='now')
    user.is_active = True
    user.is_superuser = True

    user.set_password(password)

    result = await session.execute(select(Role).where(Role.name == 'admin'))
    admin_role = result.scalars().first()

    if admin_role:
        user_role = UserRole(user=user, role=admin_role)
        session.add(user_role)
    else:
        print("Admin role not found.")

    session.add(user)
    await session.commit()
    print(f"Superuser {email} created.")
    return user


@connection
async def create_fake_user(session):
    user = User()
    user.first_name = fake.first_name()
    user.last_name = fake.last_name()
    user.patronymic = fake.middle_name()
    user.email = fake.unique.email()
    user.email_confirmed = fake.boolean(chance_of_getting_true=50)
    user.phone_number = fake.unique.phone_number()
    user.registered_at = fake.date_time_between(start_date='-1y', end_date='now')
    user.is_active = True
    user.is_superuser = False

    password = fake.password(length=10)
    user.set_password(password)

    result = await session.execute(select(Role).where(Role.name != 'admin'))
    roles = result.scalars().all()
    if roles:
        role = random.choice(roles)
        user_role = UserRole(user=user, role=role)
        session.add(user_role)

    session.add(user)
    try:
        await session.commit()
        print(f"User added to DB.")
    except Exception as e:
        await session.rollback()
        print(f"Exception on add user: {e}")
    return user


async def populate_users(count=10):
    superuser_email = "admin@szmk.pro"
    superuser_password = "RLcb!!Dk911__0"
    await create_superuser(superuser_email, superuser_password)

    # for _ in range(count):
    #     await create_fake_user()
