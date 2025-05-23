import datetime
import os.path

from fastapi import UploadFile, Request, Response, Depends
from sqladmin import ModelView, BaseView, expose
from sqlalchemy.ext.asyncio import AsyncSession

from wtforms import FileField

from app.database.db import get_db_session, connection
from app.projects.models import Project, ProjectImage
from app.settings import settings
from src.make_thumbnail_with_crop import make_thumbnail_with_crop


class FileUploadAdminView(BaseView):
    name = "Загрузка файла"
    icon = "fa-solid fa-upload"

    @expose("/upload_projects", methods=["GET", "POST"])
    async def upload_projects(self, request: Request):
        if request.method == "GET":
            return await self.templates.TemplateResponse(request, "upload_projects.html")

        session = await anext(get_db_session())
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file:
            return await self.templates.TemplateResponse(
                request,
                "upload_projects.html",
                {"error": "Файл не был загружен"}
            )

        if not uploaded_file.filename.endswith('.zip'):
            return await self.templates.TemplateResponse(
                request,
                "upload_projects.html",
                {"error": "Загруженный файл должен быть ZIP архивом"}
            )

        import zipfile
        import io
        import imghdr

        file_data = await uploaded_file.read()
        zip_io = io.BytesIO(file_data)

        try:
            with zipfile.ZipFile(zip_io) as zip_file:
                # Проверяем содержимое на наличие только изображений
                for file_info in zip_file.filelist:
                    if file_info.filename.startswith('__MACOSX') or file_info.filename.startswith('.'):
                        continue

                    with zip_file.open(file_info) as file:
                        file_content = file.read()
                        if not imghdr.what(None, h=file_content):
                            return await self.templates.TemplateResponse(
                                request,
                                "upload_projects.html",
                                {"error": f"Файл {file_info.filename} не является изображением"}
                            )

                # Создаем проект
                project_name = os.path.splitext(uploaded_file.filename)[0]
                project = Project(
                    name=project_name,
                    about=f"Реализованный проект: {project_name}",
                    public=True,
                    published_at=datetime.datetime.now()
                )

                session.add(project)
                await session.flush()

                print("Добавлен проект", project_name, project)
                
                # Создаем записи изображений
                for file_info in zip_file.filelist:
                    if file_info.filename.startswith('__MACOSX') or file_info.filename.startswith('.'):
                        continue

                    with zip_file.open(file_info) as file:
                        file_content = file.read()
                        filename = os.path.basename(file_info.filename)

                        # Сохраняем оригинал
                        save_path = os.path.join(settings.media_path, "projects", filename)
                        with open(save_path, "wb") as f:
                            f.write(file_content)

                        # Создаем миниатюру
                        thumbnail_im = make_thumbnail_with_crop(file_content)
                        thumb_filename = f"thumb_{filename}"
                        thumb_path = os.path.join(settings.media_path, "projects", thumb_filename)
                        thumbnail_im.save(thumb_path, format="JPEG")

                        # Создаем запись в БД
                        project_image = ProjectImage(
                            project_id=project.id,
                            image=filename,
                            thumbnail=thumb_filename,
                            is_preview=True,
                            is_published=True
                        )
                        session.add(project_image)
                        print("Добавлено изображение")
                await session.commit()

                return await self.templates.TemplateResponse(
                    request,
                    "upload_projects.html",
                    {"success": f"Проект {project_name} успешно создан"}
                )

        except zipfile.BadZipFile:
            return await self.templates.TemplateResponse(
                request,
                "upload_projects.html",
                {"error": "Загруженный файл поврежден или не является ZIP архивом"}
            )
        except Exception as e:
            return await self.templates.TemplateResponse(
                request,
                "upload_projects.html",
                {"error": f"Произошла ошибка при обработке файла: {str(e)}"}
            )



class ProjectAdmin(ModelView, model=Project):
    column_list = [
        Project.id,
        Project.name,
    ]
    name_plural = "Проекты"
    name = "Проект"
    icon = "fa-solid fa-building"


class ProjectImageAdmin(ModelView, model=ProjectImage):
    column_list = [
        ProjectImage.id,
        ProjectImage.is_preview,
        ProjectImage.is_published,
    ]

    form_overrides = dict(image=FileField, thumbnail=FileField)
    form_excluded_columns = ["thumbnail"]

    async def on_model_change(self, form: dict, model, is_created, request):
        image_file: UploadFile | None = form.pop('image', None)

        if image_file:
            image_data = await image_file.read()
            filename = image_file.filename

            save_path = os.path.join(settings.media_path, "projects", filename)
            with open(save_path, "wb") as f:
                f.write(image_data)

            model.image = filename

            thumbnail_im = make_thumbnail_with_crop(image_data)
            thumb_filename = f"thumb_{filename}"
            thumb_path = os.path.join(settings.media_path, "projects", thumb_filename)
            thumbnail_im.save(thumb_path, format="JPEG")
            model.thumbnail = thumb_filename

        await super().on_model_change(form, model, is_created, request)

