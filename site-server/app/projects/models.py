from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.settings import settings


class Project(Base):
    __tablename__ = "projects"

    name: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)
    about: Mapped[Optional[str]] = mapped_column(String(length=5000), nullable=True)
    public: Mapped[Optional[bool]] = mapped_column(default=False, server_default="False", nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        default=lambda: datetime.now(),
        nullable=False
    )

    images: Mapped[List["ProjectImage"]] = relationship(
        "ProjectImage",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select"
    )

    @property
    def preview_image(self) -> Optional["ProjectImage"]:
        preview = next((img for img in self.images if img.is_preview), None)
        if preview:
            return preview
        return self.images[0] if self.images else None

    def __repr__(self) -> str:
        return f"Project(id={self.id}, name={self.name})"


class ProjectImage(Base):
    __tablename__ = "project_images"

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)

    thumbnail: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)

    description: Mapped[Optional[str]] = mapped_column(String(length=255), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="False", nullable=False)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False, server_default="False", nullable=False)

    project = relationship("Project", back_populates="images")

    def __repr__(self) -> str:
        return f"ProjectImage(id={self.id}, project_id={self.project_id})"

    @property
    def image_url(self) -> Optional[str]:
        if not self.image:
            return None
        return f"/api/media/projects/{self.image}"

    @property
    def thumbnail_url(self) -> Optional[str]:
        if not self.image:
            return None
        return f"/api/media/projects/{self.thumbnail}"
