import uuid

from django.db import models

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

    product = models.ForeignKey(
        'Product',
        related_name='product_pictures',
        on_delete=models.CASCADE,
    )

    image_filename = models.CharField('Имя файла', max_length=120, blank=True, null=True)
    image = models.ImageField('Ссылка на изображение', upload_to=f"images/products/", blank=True, null=True)

    def __str__(self):
        return '{}'.format(f'{self.image}')


class Fabric(models.Model):
    """Ткани"""
    class Meta:
        verbose_name = "Ткань"
        verbose_name_plural = "Ткани"

    fabric_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    name = models.CharField('Название ткани', max_length=255)

    image_filename = models.CharField('Имя файла', max_length=120, blank=True, null=True)
    image = models.ImageField('Ссылка на изображение', upload_to=f"images/products/", blank=True, null=True)

    def __str__(self):
        return '{}'.format(f'{self.name}')


class Order(models.Model):
    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    order_id = models.UUIDField('API ID', default=uuid.uuid4, unique=True)
    # Номер заказа берется из учетной системы
    number = models.CharField('Номер заказа', max_length=30, blank=True, unique=True)
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
    second_fabric = models.ForeignKey(Fabric, related_name='order_products_second',  verbose_name='Ткань компаньон',
                                      on_delete=models.CASCADE, null=True, blank=True)
    third_fabric = models.ForeignKey(Fabric, related_name='order_products_third',  verbose_name='Ткань дополнительная',
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


class Assignment(models.Model):
    """Класс хранящий данные о состоянии выполнения нарядов"""
    class Meta:
        verbose_name = 'Наряд'
        verbose_name_plural = 'Наряды'
        ordering = ['id']

    STATUS_CHOICES = [
        ("await", "Ожидает назначения"),
        ("in_work", "В работе"),
        ("ready", "Выполнен"),
        ("cancelled", "Отменен"),
    ]

    number = models.IntegerField('Порядковый номер наряда', default=1)
    date_completion = models.DateTimeField('Дата завершения', null=True, blank=True)

    notes = models.CharField('Заметки', max_length=250, blank=True)
    status = models.CharField('Статус', max_length=50, choices=STATUS_CHOICES, default="await")
    price = models.DecimalField('Тариф', max_digits=8, decimal_places=2, default=0.00)

    order_product = models.ForeignKey(
        OrderProduct,
        related_name='assignments',
        verbose_name='Позиция заказа',
        on_delete=models.SET_NULL,
        null=True
    )
    department = models.ForeignKey(
        Department,
        related_name='assignments',
        verbose_name='Отдел',
        on_delete=models.SET_NULL,
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


class ProductionStep(models.Model):
    """Класс хранящий данные об этапе"""
    class Meta:
        verbose_name = 'Этап производства'
        verbose_name_plural = 'Этапы производства'

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

    tax = models.IntegerField("Производственный тариф", default=0)

    def __str__(self):
        return '{}'.format(f'{self.department} {self.product}')


class TechnologicalProcess(models.Model):
    """Класс сохраняющий схемы технологических процессов"""
    class Meta:
        verbose_name = 'Технологический процесс'
        verbose_name_plural = 'Технологические процессы'

    name = models.CharField('Наименование', max_length=250)
    schema = models.JSONField('Схема', default=None)
    image = models.ImageField('Изображение схемы процесса', upload_to=f"images/processes/")

    def __str__(self):
        return '{}'.format(f'{self.name}')
