import datetime
import uuid
from io import BytesIO

from PIL import Image
from django.core.files.base import ContentFile
from django.db import models
from django.utils import timezone

from staff.models import Department, Employee


class Product(models.Model):
    class Meta:
        verbose_name = 'Изделие'
        verbose_name_plural = 'Изделия'
        # Отсортирован по убыванию ID. Позволяет получать самые свежие товары в начале.
        ordering = ['-id']

    # Выбор статуса разработки. Для отделения изделий не готовых к производству.
    STATUS_CHOICES = [
        ('1', 'Новый'),
        ('2', 'Ожидает назначения'),
        ('3', 'В разработке'),
        ('4', 'Разработан'),
    ]

    status = models.CharField('Статус', max_length=25, choices=STATUS_CHOICES, default='1')
    product_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    name = models.CharField('Наименование официальное', max_length=250, blank=True, unique=True)

    # Возможность устанавливать внутреннее, не официальное наименование
    name_internal = models.CharField('Наименование внутреннее', max_length=250, blank=True)

    # Выбор типа товара. Нужен для соответствия модели товаров в системе МойСклад и дальнейшей обработке
    TYPE_CHOICES = [
        ('product', 'Товар'),
        ('variant', 'Модификация'),
    ]
    type = models.CharField('Товар/Модификация', max_length=7, choices=TYPE_CHOICES, default='product')

    # Группа товара берется из учетной системы
    group = models.CharField('Группа товара', max_length=250, blank=True)

    technological_process = models.ForeignKey(
        "TechnologicalProcess",
        verbose_name='Технологический процесс',
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )

    technological_process_confirmed = models.ForeignKey(
        Employee,
        verbose_name="Технологический процесс подтвердил",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )

    description = models.TextField('Описание товара', blank=True, null=True)

    def __str__(self):
        return '{}'.format(f'{self.name}')


class ProductPicture(models.Model):
    """Изображения изделий"""

    class Meta:
        verbose_name = "Изображение изделия"
        verbose_name_plural = "Изображения изделий"
        ordering = ['-id']

    product = models.ForeignKey(
        'Product',
        related_name='product_pictures',
        on_delete=models.CASCADE,
    )

    image_filename = models.CharField('Имя файла', max_length=240, blank=True, null=True)
    image = models.ImageField('Ссылка на изображение', upload_to=f"images/products/", blank=True, null=True)

    thumbnail = models.ImageField('Миниатюра', upload_to=f"images/products/thumbnails/", blank=True, null=True)

    def save(self, *args, **kwargs):
        # Если у экземпляра есть атрибут _creating_thumbnail и он True, мы пропускаем создание миниатюры
        if hasattr(self, '_creating_thumbnail') and self._creating_thumbnail:
            super().save(*args, **kwargs)
            return

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


class Fabric(models.Model):
    """Ткани"""

    class Meta:
        verbose_name = "Ткань"
        verbose_name_plural = "Ткани"

    fabric_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    name = models.CharField('Название ткани', max_length=255)

    image_filename = models.CharField('Имя файла', max_length=240, blank=True, null=True)
    image = models.ImageField(
        'Ссылка на изображение',
        upload_to=f"images/products/",
        blank=True,
        null=True,
        max_length=256,
    )
    thumbnail = models.ImageField(
        'Миниатюра',
        upload_to=f"images/products/thumbnails/",
        blank=True,
        null=True,
        max_length=256,
    )

    def save(self, *args, **kwargs):
        # Если у экземпляра есть атрибут _creating_thumbnail и он True, мы пропускаем создание миниатюры
        if hasattr(self, '_creating_thumbnail') and self._creating_thumbnail:
            super().save(*args, **kwargs)
            return

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
        return '{}'.format(f'{self.name}')


class Order(models.Model):
    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    order_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    # Номер заказа берется из учетной системы
    number = models.CharField('Номер заказа', max_length=30, blank=True, unique=True)
    moment = models.DateTimeField('Дата документа', blank=True, null=True)

    project = models.CharField('Проект', max_length=250, blank=True)
    planned_date = models.DateField('Произв. (пл. Дата):', blank=True, null=True)

    # Градация срочности от 1 до 4, где 1 очень срочный/горящий
    urgency = models.SmallIntegerField('Срочность', default=3)

    # Общие комментарии по базе (каркасу) и чехлу
    comment_base = models.TextField('Коммент. (каркас):', blank=True)
    comment_case = models.TextField('Коммент. (чехол):', blank=True)

    def __str__(self):
        return '{}'.format(f'{self.number} {self.project}')


class OrderProduct(models.Model):
    """Позиция заказа, она же серия производства"""

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказов'
        # По умолчанию сортировка срочность - заказ - ID
        ordering = ['urgency', 'order', 'id']

    STATUS_CHOICES = [
        ("0", "Ожидает"),
        ("1", "Изготовлен"),
    ]

    series_id = models.CharField('ID Серии', max_length=50, unique=True, null=True)
    status = models.CharField('Статус', max_length=50, choices=STATUS_CHOICES, default="0")

    product = models.ForeignKey(
        Product,
        related_name='order_products',
        verbose_name='Изделие',
        on_delete=models.CASCADE
    )

    order = models.ForeignKey(
        Order,
        related_name='order_products',
        verbose_name='Заказ',
        on_delete=models.CASCADE,
        null=True,
        default=None
    )
    # До трех видов ткани на изделие
    main_fabric = models.ForeignKey(Fabric, related_name='order_products_main', verbose_name='Ткань основа',
                                    on_delete=models.CASCADE, null=True, blank=True)
    second_fabric = models.ForeignKey(Fabric, related_name='order_products_second', verbose_name='Ткань компаньон',
                                      on_delete=models.CASCADE, null=True, blank=True)
    third_fabric = models.ForeignKey(Fabric, related_name='order_products_third', verbose_name='Ткань дополнительная',
                                     on_delete=models.CASCADE, null=True, blank=True)

    quantity = models.IntegerField('Количество', default=1)

    price = models.DecimalField('Цена', max_digits=10, decimal_places=2, default=0.00)

    # Индивидуальное назначение срочности производства
    urgency = models.SmallIntegerField('Срочность', default=3)

    # Индивидуальные комментарии каркас/чехол
    comment_base = models.TextField('Коммент. (каркас):', blank=True)
    comment_case = models.TextField('Коммент. (чехол):', blank=True)

    def __str__(self):
        return '{}'.format(f'{self.series_id}: {self.product.name_internal} - {self.status}')


class ProductionStepTariff(models.Model):
    """Класс хранящий данные о тарификации этапа производства"""

    class Meta:
        verbose_name = 'Тарификация этапа'
        verbose_name_plural = 'Тарификации этапов'

    product = models.ForeignKey(
        Product,
        verbose_name='Изделие',
        related_name='production_step_tariffs',
        on_delete=models.CASCADE
    )

    department = models.ForeignKey(
        Department,
        verbose_name='Отдел',
        related_name='production_step_tariffs',
        on_delete=models.CASCADE
    )

    tariff = models.IntegerField("Утвержденный тариф", default=0)
    proposed_tariff = models.IntegerField("Предложенный тариф", default=0)

    confirmation_date = models.DateTimeField(
        'Дата/Время утверждения',
        blank=True,
        null=True,
    )
    proposed_date = models.DateTimeField(
        'Дата/Время предложения',
        blank=True,
        null=True,
    )

    approved_by = models.ForeignKey(
        Employee,
        verbose_name='Тарификацию утвердил',
        related_name='production_step_tariffs',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    proposed_by = models.ForeignKey(
        Employee,
        verbose_name='Тарификацию утвердил',
        related_name='production_step_proposed_tariffs',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    def save(self, *args, **kwargs):
        # Если объект уже существует, то проверяем изменения
        if self.pk:
            orig = ProductionStepTariff.objects.get(pk=self.pk)

            # Если значение tariff было изменено, устанавливаем текущую дату для confirmation_date
            if orig.tariff != self.tariff:
                self.confirmation_date = datetime.datetime.now()

            # Если значение proposed_tariff было изменено, устанавливаем текущую дату для proposed_date
            if orig.proposed_tariff != self.proposed_tariff:
                self.proposed_date = datetime.datetime.now()

        else:  # Объект создается
            if self.tariff:  # Если tariff установлен
                self.confirmation_date = datetime.datetime.now()

            if self.proposed_tariff:  # Если proposed_tariff установлен
                self.proposed_date = datetime.datetime.now()

        super(ProductionStepTariff, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(f'{self.tariff} {self.department.name} '
                           f'{self.confirmation_date.date()} {self.product} {self.approved_by}')


class ProductionStep(models.Model):
    """Класс хранящий данные об этапе"""

    class Meta:
        verbose_name = 'Этап производства'
        verbose_name_plural = 'Этапы производства'
        unique_together = ['department', 'product']

    # Ссылка на отдел производства и на этапы производства
    department = models.ForeignKey(Department, on_delete=models.CASCADE, verbose_name='production_steps')
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='production_steps'
    )

    # Добавляем плановое время выполнения этапа
    scheduled_time = models.PositiveIntegerField("План время этапа (минут)", default=0)

    # Добавляем ссылку на последующие этапы
    next_step = models.ManyToManyField(
        "ProductionStep",
        verbose_name="Последующие этапы",
        related_name="production_steps",
        blank=True
    )

    production_step_tariff = models.ForeignKey(
        ProductionStepTariff,
        verbose_name='Тарификация',
        related_name="production_steps",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    is_active = models.BooleanField('Этап задействован в производстве', default=True)

    def __str__(self):
        return '{}'.format(f'{self.department} {self.product}')


class Assignment(models.Model):
    """Класс хранящий данные о состоянии выполнения нарядов"""

    class Meta:
        verbose_name = 'Наряд'
        verbose_name_plural = 'Наряды'
        ordering = ['id']
        unique_together = ['number', 'order_product', 'department']

    STATUS_CHOICES = [
        ("created", "Создан"),
        ("await", "Ожидает назначения"),
        ("in_work", "В работе"),
        ("ready", "Выполнен"),
        ("cancelled", "Отменен"),
    ]

    number = models.IntegerField('Порядковый номер наряда', default=1)
    date_completion = models.DateTimeField('Дата готовности', null=True, blank=True)

    notes = models.CharField('Заметки', max_length=250, blank=True)
    status = models.CharField('Статус', max_length=50, choices=STATUS_CHOICES, default="await")

    tariff = models.ForeignKey(
        ProductionStepTariff,
        related_name='assignments',
        verbose_name='Тарификация',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    order_product = models.ForeignKey(
        OrderProduct,
        related_name='assignments',
        verbose_name='Позиция заказа',
        on_delete=models.CASCADE,
        null=True
    )

    department = models.ForeignKey(
        Department,
        related_name='assignments',
        verbose_name='Отдел',
        on_delete=models.CASCADE,
        null=True
    )
    executor = models.ForeignKey(
        Employee,
        related_name='assignments_executor',
        verbose_name='Исполнитель',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    inspector = models.ForeignKey(
        Employee,
        related_name='assignments_inspector',
        verbose_name='Проверяющий',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        default=None
    )

    def __str__(self):
        return '{}'.format(f'№{self.number} - {self.order_product.series_id} {self.status}')


class TechnologicalProcess(models.Model):
    """Класс сохраняющий схемы технологических процессов"""

    class Meta:
        verbose_name = 'Технологический процесс'
        verbose_name_plural = 'Технологические процессы'

    name = models.CharField('Наименование', max_length=250)
    schema = models.JSONField('Схема', default=None)
    image = models.ImageField('Изображение схемы процесса', upload_to=f"images/processes/", blank=True, null=True)

    def __str__(self):
        return '{}'.format(f'{self.name}')
