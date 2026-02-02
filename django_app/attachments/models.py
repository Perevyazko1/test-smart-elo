from django.db import models
from django.conf import settings

from staff.models import Department


class Attachment(models.Model):
    TYPE_CHOICES = [
        ('image', 'Изображение'),
        ('video', 'Видео'),
        ('audio', 'Звуковое сообщение'),
        ('text', 'Текстовая заметка'),
        ('file', 'Файл'),
    ]

    CONTENT_TYPE_CHOICES = [
        ('product', 'Продукт'),
        ('order', 'Заказ'),
        ('task', 'Задача'),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES, verbose_name="Тип заметки")
    file = models.FileField(upload_to='attachments/%Y/%m/%d/', null=True, blank=True, verbose_name="Файл")
    text = models.TextField(null=True, blank=True, verbose_name="Текстовая заметка")

    # Связь
    content_type = models.CharField(
        max_length=20, 
        choices=CONTENT_TYPE_CHOICES, 
        null=True, 
        blank=True, 
        verbose_name="Тип сущности"
    )
    object_id = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, 
        verbose_name="ID сущности"
    )

    # Метаданные
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Автор"
    )
    department= models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Отдел"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Вложение"
        verbose_name_plural = "Вложения"
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"{self.get_type_display()} - {self.id}"



