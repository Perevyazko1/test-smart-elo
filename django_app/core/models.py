import uuid
from io import BytesIO

from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import models

from staff.models import Department, Employee
from django.utils import timezone


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
        # Сохраняем объект, чтобы убедиться, что у нас есть ID для генерации имени файла миниатюры
        super().save(*args, **kwargs)

        if self.image:
            # Проверяем, существует ли уже миниатюра
            if not default_storage.exists(self.image.name):
                img = Image.open(self.image.path)
                img.thumbnail((100, 100))

                image_io = BytesIO()
                img.save(image_io, format=img.format, quality=90)
                image_content = ContentFile(image_io.getvalue())

                # Сохраняем миниатюру
                self.thumbnail.save(self.image.name, image_content, save=False)

            # Обновляем только поле thumbnail, чтобы избежать рекурсии
            super(Fabric, self).save(update_fields=['thumbnail'])

    def __str__(self):
        return '{}'.format(f'{self.name}')


class Order(models.Model):
    """Order model. """

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    STATUS_CHOICES = [
        ("0", "В работе"),
        ("1", "Изготовлен"),
    ]

    order_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    # Номер заказа берется из учетной системы
    number = models.CharField('Номер заказа', max_length=30, blank=True, unique=True)
    moment = models.DateTimeField('Дата документа', blank=True, null=True)

    project = models.CharField('Проект', max_length=250, blank=True)
    planned_date = models.DateField('Произв. (пл. Дата):', blank=True, null=True)

    # Градация срочности от 1 до 4, где 1 очень срочный/горящий
    urgency = models.SmallIntegerField('Срочность', default=3)

    inner_number = models.CharField('Вх. заказ (№):', max_length=250, blank=True)

    # Общие комментарии по базе (каркасу) и чехлу
    comment_base = models.TextField('Коммент. (каркас):', blank=True)
    comment_case = models.TextField('Коммент. (чехол):', blank=True)

    status = models.CharField('Статус', max_length=50, choices=STATUS_CHOICES, default="0")

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

    def __str__(self):
        return '{}'.format(f'{self.series_id}: {self.product.name_internal} - {self.status}')


class OrderProductComment(models.Model):
    """Комментарий к позиции производства. """

    class Meta:
        verbose_name = 'Комментарий к ПЗ'
        verbose_name_plural = 'Комментарии к ПЗ'
        ordering = ['-important', '-add_date']

    author = models.ForeignKey(Employee, verbose_name='Автор', on_delete=models.CASCADE)
    order_product = models.ForeignKey(OrderProduct, verbose_name='Позиция заказа', on_delete=models.CASCADE)
    important = models.BooleanField('Важное', default=False)
    add_date = models.DateTimeField('Дата добавления', auto_now_add=True, blank=True)
    deleted = models.BooleanField('Удалено', default=False)
    text = models.CharField('Комментарий', max_length=255)

    def __str__(self):
        return '{}'.format(f'{self.author}: {self.order_product.series_id} - {self.text[:50]}')


class Tariff(models.Model):
    """Class for different tariffs. """
    amount = models.IntegerField("Сумма", default=0)
    add_date = models.DateTimeField('Дата добавления', blank=True, default=timezone.now)
    created_by = models.ForeignKey(
        Employee,
        verbose_name='Создал',
        related_name='tariffs',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    comment = models.CharField('Комментарий', max_length=250, blank=True, null=True)


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

    is_active = models.BooleanField('Этап задействован в производстве', default=True)

    confirmed_tariff = models.ForeignKey(
        Tariff,
        verbose_name='Утвержденный тариф',
        related_name="production_steps_confirmed",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    proposed_tariff = models.ForeignKey(
        Tariff,
        verbose_name='Предложенный тариф',
        related_name="production_steps_proposed",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        return '{}'.format(f'{self.department} {self.product}')


class ProductionStepComment(models.Model):
    """Класс хранящий данные об этапе"""

    class Meta:
        verbose_name = 'Комментарий к сделке'
        verbose_name_plural = 'Комментарии к сделкам'
        ordering = ['-add_date']

    author = models.ForeignKey(
        Employee,
        verbose_name="Автор",
        related_name="production_step_comment_author",
        on_delete=models.SET_NULL,
        null=True,
    )
    production_step = models.ForeignKey(
        ProductionStep,
        verbose_name="Этап производства",
        related_name="production_step_comments",
        on_delete=models.CASCADE,
        null=True,
    )
    comment = models.CharField("Комментарий", max_length=255)
    add_date = models.DateTimeField('Дата добавления', auto_now_add=True, blank=True,
                                    null=True)

    def __str__(self):
        return '{}'.format(f'{self.author}: {self.production_step.id} - {self.comment[:50]}')


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

    notes = models.CharField('Заметки', max_length=250, blank=True)

    status = models.CharField('Статус', max_length=50, choices=STATUS_CHOICES, default="await")

    amount = models.IntegerField("Вознаграждение", default=0)
    new_tariff = models.ForeignKey(
        Tariff,
        related_name='assignments_set',
        verbose_name='Тариф (новый)',
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

    date_completion = models.DateTimeField('Дата готовности', null=True, blank=True)
    appointment_date = models.DateTimeField('Дата взятия в работу', null=True, blank=True)
    plane_date = models.DateTimeField('План дата готовности', null=True, blank=True)
    inspect_date = models.DateTimeField('Дата визирования', null=True, blank=True)
    tariffication_date = models.DateTimeField(
        'Дата тарифицирования',
        null=True,
        blank=True,

    )

    appointed_by_boss = models.BooleanField('Назначен бригадиром', blank=True, default=False)
    assembled = models.BooleanField('Укомплектован', blank=True, default=True)

    def __str__(self):
        return '{}'.format(f'№{self.number} - {self.order_product.series_id}')


class AssignmentCoExecutor(models.Model):
    assignment = models.ForeignKey('Assignment',
                                   related_name='co_executors',
                                   on_delete=models.CASCADE)
    co_executor = models.ForeignKey(Employee,
                                    related_name='co_executed_assignments',
                                    on_delete=models.CASCADE)
    amount = models.IntegerField("Сумма", default=0)

    class Meta:
        unique_together = ['assignment', 'co_executor']
        verbose_name = 'Соисполнитель'
        verbose_name_plural = 'Соисполнители'


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
