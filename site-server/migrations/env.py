import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.database.base import Base

from dotenv import load_dotenv
load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

db_url = os.getenv("DB_URL")

if not db_url:
    raise Exception(f"Переменная окружения DB_URL не установлена! {os.environ}")

# config.set_section_option(
#     "db",
#     "sqlalchemy.url",
#     db_url
# )

# Set the main SQLAlchemy URL
config.set_main_option("sqlalchemy.url", db_url)


config.set_section_option(
    "devdb",
    "sqlalchemy.url",
    "postgresql+asyncpg://postgres:changeme@dev-db:5432/dev-db"
)
# config.set_section_option(
#     "testdb",
#     "sqlalchemy.url",
#     "postgresql+asyncpg://postgres:changeme@127.0.0.1:5434/test_db"
# )


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
