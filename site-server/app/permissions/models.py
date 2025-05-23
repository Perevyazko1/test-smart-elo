from typing import Optional, Literal

from sqlalchemy import String, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Role(Base):
    __tablename__ = "roles"

    name: Mapped[Optional[str]] = mapped_column(String(length=50), unique=True, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="True", nullable=True)

    permissions: Mapped[list["Permission"]] = relationship(
        "Permission",
        secondary="role_permissions",
        back_populates="roles"
    )

    def __repr__(self) -> str:
        return f"Role OBJ: (id={self.id!r}, name={self.name!r})"


class Permission(Base):
    __tablename__ = "permissions"

    resource: Mapped[Optional[str]] = mapped_column(String(length=2083), nullable=True)  # MAX URL

    Actions = Literal[
        "view",
        "create",
        "update",
        "delete",
        "ownView",
        "ownCreate",
        "ownUpdate",
        "ownDelete",
    ]
    action: Mapped[Optional[Actions]] = mapped_column(String(length=50), nullable=True)

    # extra data
    attributes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    roles: Mapped[list["Role"]] = relationship(
        "Role",
        secondary="role_permissions",
        back_populates="permissions"
    )

    def __repr__(self) -> str:
        return f"{self.resource}:{self.action}"


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id"), nullable=True)

    def __repr__(self) -> str:
        return f"RolePermission OBJ: (id={self.id!r}, role_id={self.role_id!r}, permission_id={self.permission_id!r})"


class UserRole(Base):
    __tablename__ = "users_roles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=True)

    user = relationship("User", back_populates="roles")
    role = relationship("Role")

    def __repr__(self) -> str:
        return f"UserRole OBJ {self.id!r}: User ID {self.user_id!r}"
