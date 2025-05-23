import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


def get_db_url():
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "changeme")
    server = os.getenv("POSTGRES_SERVER", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "db")

    print(f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}")
    return f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"


engine = create_async_engine(url=get_db_url(), echo=True)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
)


def connection(func):
    async def wrapper(*args, **kwargs):
        async with async_session() as session:
            try:
                result = await func(session, *args, **kwargs)
                return result
            except Exception:
                await session.rollback()
                raise
    return wrapper


async def get_db_session():
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
