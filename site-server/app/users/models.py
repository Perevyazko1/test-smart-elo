from datetime import datetime
from typing import Optional

import bcrypt
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    first_name: Mapped[Optional[str]] = mapped_column(String(length=50), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(length=50), nullable=True)
    patronymic: Mapped[Optional[str]] = mapped_column(String(length=50), nullable=True)

    email: Mapped[Optional[str]] = mapped_column(String(length=320), unique=True, nullable=True)  # RFC 5321 limit
    email_confirmed: Mapped[Optional[bool]] = mapped_column(nullable=True)

    phone_number: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        unique=True,
        nullable=True,
    )

    password_hash: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=False)  # hashed

    registered_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        default=lambda: datetime.now(),
        nullable=False
    )

    is_active: Mapped[Optional[bool]] = mapped_column(default=True, server_default="True", nullable=True)
    is_superuser: Mapped[Optional[bool]] = mapped_column(default=False, server_default="False", nullable=True)

    roles = relationship("UserRole", back_populates="user")

    def set_password(self, password: str):
        if len(password) < 8:
            raise ValueError("Пароль должен быть не менее 8 символов")
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        return self.password_hash

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def __repr__(self) -> str:
        return f"User OBJ: (id={self.id!r}, first_name={self.first_name!r}, last_name={self.last_name!r})"
