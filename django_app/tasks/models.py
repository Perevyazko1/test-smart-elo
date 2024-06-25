"""Task models. """
from django.db import models
from django.core.files.base import ContentFile

from PIL import Image
from io import BytesIO

from staff.models import Employee, Department


class Task(models.Model):
    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'

    STATUS_CHOICES = [
        ('1', 'Ожидает'),
        ('2', 'В работе'),
        ('3', 'Готова'),
        ('4', 'Отменена'),
    ]
    status = models.CharField(
        "Статус",
        max_length=50,
        choices=STATUS_CHOICES,
        default='1',
        blank=True,
    )

    URGENCY_CHOICES = [
        ('1', 'Низкая'),
        ('2', 'Обычная'),
        ('3', 'Важная'),
        ('4', 'Горящая'),
    ]
    urgency = models.CharField(
        "Срочность",
        max_length=50,
        choices=URGENCY_CHOICES,
        default='2',
        blank=True,
    )

    VIEW_CHOICES = [
        ('1', 'Только мне'),
        ('2', 'Видна отделу'),
        ('3', 'Видна всем'),
        ('4', 'Мне и исполнителям'),
    ]
    view_mode = models.CharField(
        "Видимость",
        max_length=50,
        choices=VIEW_CHOICES,
        default='1',
        blank=True,
    )
    for_department = models.ForeignKey(
        Department,
        verbose_name="Видна в отделе",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    title = models.CharField("Название", max_length=255)
    description = models.TextField("Описание", max_length=5000, blank=True, null=True)

    deadline = models.DateTimeField("Крайний срок", blank=True, null=True)
    created_at = models.DateTimeField("Когда создана", auto_now_add=True)
    ready_at = models.DateTimeField("Когда готова", blank=True, null=True)
    verified_at = models.DateTimeField("Когда завизирована", blank=True, null=True)
    appointed_at = models.DateTimeField("Когда назначена", blank=True, null=True)

    created_by = models.ForeignKey(
        Employee,
        verbose_name="Кем создана",
        related_name="created_tasks",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    appointed_by = models.ForeignKey(
        Employee,
        verbose_name="Кем назначена",
        related_name="appointed_tasks",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    executor = models.ForeignKey(
        Employee,
        verbose_name="Исполнитель",
        related_name="executor_tasks",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    co_executors = models.ManyToManyField(
        Employee,
        verbose_name="Соисполнители",
        related_name="co_executors_tasks",
    )

    def __str__(self):
        return '{}'.format(f'{self.appointed_by.username} => {self.title}')


class TaskImage(models.Model):
    class Meta:
        verbose_name = 'Изображение задачи'
        verbose_name_plural = 'Изображения задач'

    task = models.ForeignKey(
        Task,
        verbose_name='Задача',
        related_name='task_images',
        on_delete=models.CASCADE,
    )

    image_filename = models.CharField('Имя файла', max_length=240, blank=True, null=True)

    image = models.ImageField('Ссылка на изображение', upload_to=f"images/tasks/", blank=True, null=True)
    thumbnail = models.ImageField('Миниатюра', upload_to=f"images/tasks/thumbnails/", blank=True, null=True)

    def save(self, *args, **kwargs):
        # Если у экземпляра есть атрибут _creating_thumbnail и он True, мы пропускаем создание миниатюры
        if hasattr(self, '_creating_thumbnail') and self._creating_thumbnail:
            super().save(*args, **kwargs)
            return

        if not self.image_filename:
            self.image_filename = self.image.name

        super().save(*args, **kwargs)

        if self.image:
            img = Image.open(self.image.path)
            img.thumbnail((100, 100))

            image_io = BytesIO()
            img.save(image_io, format=img.format)
            image_content = ContentFile(image_io.getvalue(), self.image_filename)

            self._creating_thumbnail = True
            self.thumbnail.save(self.image_filename, image_content)
            del self._creating_thumbnail

    def __str__(self):
        return '{}'.format(f'{self.image}')
