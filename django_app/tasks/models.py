"""Task models. """
from django.utils import timezone
from django.db import models
from django.core.files.base import ContentFile

from PIL import Image
from io import BytesIO

from staff.models import Employee, Department


class TaskTariff(models.Model):
    amount = models.PositiveIntegerField("Сумма", default=0)
    add_date = models.DateTimeField('Дата добавления', blank=True, default=timezone.now)
    created_by = models.ForeignKey(
        Employee,
        verbose_name='Создал',
        related_name='tasks_created_tariffs',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    task = models.ForeignKey(
        'Task',
        verbose_name='Задача',
        related_name='task_tariffs',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    comment = models.CharField('Комментарий', max_length=250, blank=True, null=True)


class TaskExecutor(models.Model):
    class Meta:
        verbose_name = 'Исполнитель'
        verbose_name_plural = 'Исполнители'
        unique_together = ['employee', 'task']

    amount = models.PositiveIntegerField("Сумма/Вознаграждение", default=0)
    employee = models.ForeignKey(
        Employee,
        verbose_name="Исполнитель",
        related_name="tasks_executor",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    task = models.ForeignKey(
        'Task',
        verbose_name='Задача',
        related_name='task_executor',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    def __str__(self):
        return '{}'.format(f'{self.task} => {self.employee} => {self.amount}')


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

    for_departments = models.ManyToManyField(
        Department,
        verbose_name="Видна в отделах",
        related_name='tasks_for_department',
        blank=True,
    )

    title = models.CharField("Название", max_length=255)
    description = models.TextField("Описание", max_length=5000, blank=True, null=True)
    execution_comment = models.TextField("Комментарий к выполнению", max_length=5000, blank=True, null=True)

    deadline = models.DateTimeField("Крайний срок", blank=True, null=True)
    created_at = models.DateTimeField("Когда создана", auto_now_add=True)
    ready_at = models.DateTimeField("Когда готова", blank=True, null=True)
    verified_at = models.DateTimeField("Когда завизирована", blank=True, null=True)
    appointed_at = models.DateTimeField("Когда назначена", blank=True, null=True)

    created_by = models.ForeignKey(
        Employee,
        verbose_name="Кем создана",
        related_name="created_tasks",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    appointed_by = models.ForeignKey(
        Employee,
        verbose_name="Кем назначена",
        related_name="appointed_tasks",
        on_delete=models.SET_NULL,
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

    new_executor = models.OneToOneField(
        TaskExecutor,
        verbose_name='Исполнитель',
        null=True,
        blank=True,
        related_name="task_new_executor",
        on_delete=models.SET_NULL,
    )

    new_co_executors = models.ManyToManyField(
        TaskExecutor,
        verbose_name="Соисполнители",
        related_name="task_new_co_executors",
    )

    co_executors = models.ManyToManyField(
        Employee,
        verbose_name="Соисполнители",
        related_name="co_executors_tasks",
    )

    confirmed_tariff = models.OneToOneField(
        TaskTariff,
        verbose_name='Утвержденный тариф',
        null=True,
        blank=True,
        related_name="task_confirmed_tariff",
        on_delete=models.SET_NULL,
    )
    proposed_tariff = models.OneToOneField(
        TaskTariff,
        verbose_name='Предложенный тариф',
        null=True,
        blank=True,
        related_name="task_proposed_tariff",
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return '{}'.format(f'{self.created_at} => {self.title}')


class TaskComment(models.Model):
    class Meta:
        verbose_name = 'Комментарий к задаче'
        verbose_name_plural = 'Комментарии к задачам'
        ordering = ['-add_date']

    author = models.ForeignKey(
        Employee,
        verbose_name="Автор",
        related_name="task_comment_author",
        on_delete=models.SET_NULL,
        null=True,
    )
    task = models.ForeignKey(
        Task,
        verbose_name="Задача",
        related_name="task_comments",
        on_delete=models.CASCADE,
        null=True,
    )
    comment = models.CharField("Комментарий", max_length=255)
    add_date = models.DateTimeField('Дата добавления', auto_now_add=True, blank=True,
                                    null=True)

    def __str__(self):
        return '{}'.format(f'{self.author}: {self.task.id} - {self.comment[:50]}')


class TaskViewInfo(models.Model):
    class Meta:
        verbose_name = 'Просмотр задачи'
        verbose_name_plural = 'Просмотры задач'

    employee = models.ForeignKey(
        Employee,
        verbose_name="Пользователь",
        related_name="task_employee_view",
        on_delete=models.CASCADE,
        null=True,
    )
    task = models.ForeignKey(
        Task,
        verbose_name="Задача",
        related_name="task_view_info",
        on_delete=models.CASCADE,
        null=True,
    )
    last_date = models.DateTimeField(
        'Дата просмотра', blank=True, null=True, auto_now=True
    )

    def __str__(self):
        return '{}'.format(f'{self.employee}: {self.task.id} - {self.last_date}')


class TaskImage(models.Model):
    class Meta:
        verbose_name = 'Изображение задачи'
        verbose_name_plural = 'Изображения задач'
        ordering = ['-id']

    task = models.ForeignKey(
        Task,
        verbose_name='Задача',
        related_name='task_images',
        on_delete=models.CASCADE,
    )

    image_filename = models.CharField('Имя файла', max_length=240, blank=True, null=True)

    image = models.ImageField(
        'Ссылка на изображение',
        upload_to=f"images/tasks/",
        max_length=255,
        blank=True,
        null=True
    )
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
