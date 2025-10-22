from django.db import models

from staff.models import Employee


class Nomenclature(models.Model):
    class Meta:
        verbose_name = 'Номенклатура'
        verbose_name_plural = 'Номенклатура'

    class Variety(models.TextChoices):
        FITTING = 'fitting', 'Комплектующие'
        MATERIAL = 'material', 'Материалы'
        PRODUCT = 'product', 'Изделие'
        CONSUMABLES = 'consumables', 'Расходник'
        INVENTORY = 'inventory', 'Инвентарь'

    class Unit(models.TextChoices):
        PIECE = 'piece', 'шт'
        METER = 'meter', 'м'
        PMETER = 'pmeter', 'пог.м'
        KILOGRAM = 'kg', 'кг'
        LITER = 'liter', 'л'
        PACK = 'pack', 'упак'
        SET = 'set', 'комплект'

    variety = models.CharField(
        'Тип',
        max_length=50,
        choices=Variety.choices,
        default=Variety.MATERIAL
    )
    name = models.CharField('Наименование', max_length=255)
    description = models.TextField('Описание', blank=True, null=True)

    def __str__(self):
        return f'{self.name} ({self.variety})'.strip()


class NomenclatureImage(models.Model):
    """Гибкие атрибуты для номенклатуры (EAV паттерн)"""

    class Meta:
        verbose_name = 'Изображения номенклатуры'
        verbose_name_plural = 'Изображение номенклатуры'

    nomenclature = models.ForeignKey(
        Nomenclature,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_filename = models.CharField(
        'Имя файла',
        max_length=240,
        blank=True,
        null=True
    )
    image = models.ImageField(
        'Ссылка на изображение',
        upload_to=f"images/nomenclature/",
        blank=True,
        null=True
    )

    thumbnail = models.ImageField(
        'Миниатюра',
        upload_to=f"images/nomenclature/thumbnails/",
        blank=True,
        null=True
    )
    order = models.PositiveIntegerField(
        'Порядок сортировки',
        default=0,
        db_index=True
    )

    def __str__(self):
        return f'{self.nomenclature} - {self.image_filename}'



class NomenclatureAttribute(models.Model):
    """Гибкие атрибуты для номенклатуры (EAV паттерн)"""

    class Meta:
        verbose_name = 'Атрибут номенклатуры'
        verbose_name_plural = 'Атрибуты номенклатуры'
        unique_together = ['nomenclature', 'attribute_name']

    nomenclature = models.ForeignKey(
        Nomenclature,
        on_delete=models.CASCADE,
        related_name='attributes'
    )
    attribute_name = models.CharField(
        'Название атрибута',
        max_length=100,
        help_text='Например: ткань, цвет, размер'
    )

    bool_value = models.BooleanField(
        'Значение флаг',
        default=False,
        blank=True,
        null=True
    )
    char_value = models.CharField(
        'Значение строковое',
        max_length=255,
        blank=True,
        null=True
    )
    text_value = models.TextField(
        'Значение текстовое',
        max_length=5000,
        blank=True,
        null=True
    )
    int_value = models.IntegerField(
        'Значение целое',
        blank=True,
        null=True
    )
    float_value = models.FloatField(
        'Значение дробное',
        blank=True,
        null=True
    )
    datetime_value = models.DateTimeField(
        'Значение даты и времени',
        blank=True,
        null=True
    )
    date_value = models.DateField(
        'Значение даты',
        blank=True,
        null=True
    )
    order = models.PositiveIntegerField(
        'Порядок сортировки',
        default=0,
        db_index=True
    )


class NomenclatureAttributeImage(models.Model):
    """Гибкие атрибуты для номенклатуры (EAV паттерн)"""

    class Meta:
        verbose_name = 'Изображения аттрибутов'
        verbose_name_plural = 'Изображение аттрибута'

    nomenclature_attribute = models.ForeignKey(
        NomenclatureAttribute,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_filename = models.CharField(
        'Имя файла',
        max_length=240,
        blank=True,
        null=True
    )
    image = models.ImageField(
        'Ссылка на изображение',
        upload_to=f"images/nomenclature_attribute/",
        blank=True,
        null=True
    )

    thumbnail = models.ImageField(
        'Миниатюра',
        upload_to=f"images/nomenclature_attribute/thumbnails/",
        blank=True,
        null=True
    )
    order = models.PositiveIntegerField(
        'Порядок сортировки',
        default=0,
        db_index=True
    )

    def __str__(self):
        return f'{self.nomenclature_attribute} - {self.image_filename}'


class SkladMovement(models.Model):
    class Meta:
        verbose_name = 'Движение товара'
        verbose_name_plural = 'Движения товаров'
        ordering = ['-created_at']


    class Type(models.TextChoices):
        INCOMING = 'incoming', 'Приход'
        OUTGOING = 'outgoing', 'Расход'
        TRANSFER = 'transfer', 'Перемещение'
        RESERVE = 'reserve', 'Резервирование'
        UNRESERVE = 'unreserve', 'Снятие резерва'
        INVENTORY = 'inventory', 'Инвентаризация'

    type = models.CharField(
        'Тип движения',
        max_length=50,
        choices=Type.choices
    )
    created_at = models.DateTimeField('Дата', auto_now_add=True)
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Ответственный'
    )
    comment = models.TextField('Комментарий', blank=True, null=True)


class MovementPosition(models.Model):
    class Meta:
        verbose_name = 'Позиция перемещения'
        verbose_name_plural = 'Позиции перемещения'

    movement = models.ForeignKey(
        SkladMovement,
        on_delete=models.CASCADE,
        related_name='positions'
    )
    nomenclature = models.ForeignKey(
        Nomenclature,
        on_delete=models.CASCADE,
        related_name='movements'
    )
    quantity = models.IntegerField(
        'Количество',
        default=1
    )
    order = models.PositiveIntegerField(
        'Порядок сортировки',
        default=0,
        db_index=True
    )
