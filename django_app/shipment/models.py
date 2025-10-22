from django.db import models
from core.models import OrderProduct
from staff.models import Employee


class Shipment(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Новая'
        IN_PROGRESS = 'in_progress', 'В процессе'
        COMPLETED = 'completed', 'Завершена'
        CANCELED = 'canceled', 'Отменена'

    class Meta:
        verbose_name = 'Отгрузка'
        verbose_name_plural = 'Отгрузки'

    status = models.CharField(
        'Статус',
        max_length=50,
        choices=Status.choices,
        default=Status.NEW
    )
    plan_date = models.DateTimeField(
        'Плановая дата отгрузки',
        null=True,
        blank=True,
    )
    comment = models.TextField('Комментарий', blank=True, null=True)
    created_at = models.DateTimeField('Создан',
                                      auto_now_add=True,
                                      null=True,
                                      blank=True)
    created_by = models.ForeignKey(Employee,
                                   verbose_name="Кто создал",
                                   on_delete=models.SET_NULL,
                                   related_name='created_shipments',
                                   null=True,
                                   blank=True)

    def __str__(self):
        return f'Отгрузка №{self.id} от {self.plan_date.strftime("%d.%m.%Y") if self.plan_date else "не назначена"}'


class ShipmentRow(models.Model):
    class Meta:
        verbose_name = 'Позиция отгрузки'
        verbose_name_plural = 'Позиции отгрузки'

    order_product = models.ForeignKey(
        OrderProduct,
        on_delete=models.CASCADE,
        verbose_name='Заказанная позиция',
        related_name='shipment_rows',
    )
    quantity = models.PositiveIntegerField('Количество', default=1)
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name='rows'
    )

    def __str__(self):
        return f'{self.order_product} - {self.quantity} шт.'


class ShipmentItem(models.Model):
    class Meta:
        verbose_name = 'Экземпляр позиции'
        verbose_name_plural = 'Экземпляры позиций'
        unique_together = ['order_product', 'number']

    shipment_row = models.ForeignKey(
        ShipmentRow,
        related_name='items',
        verbose_name='Позиция отгрузки',
        on_delete=models.CASCADE)

    order_product = models.ForeignKey(
        OrderProduct,
        on_delete=models.CASCADE,
        verbose_name='Заказанная позиция',
        related_name='shipment_items',
        blank=True,
        null=True
    )
    
    number = models.PositiveIntegerField(
        verbose_name='Номер экземпляра',
        blank=True,
        null=True)
    is_reserved = models.BooleanField(
        verbose_name='Зарезервирован',
        default=False)
    reserver_id = models.PositiveIntegerField(
        'ID Зарезервированного товара',
        blank=True,
        null=True)
    reserved_at = models.DateTimeField(
        verbose_name='Дата проверки',
        null=True,
        blank=True)
    reserved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        related_name='reserved_shipments',
        null=True,
        blank=True)

    is_checked = models.BooleanField(
        verbose_name='Проверен',
        default=False)
    checked_at = models.DateTimeField(
        verbose_name='Дата проверки',
        null=True,
        blank=True)
    checked_by = models.ForeignKey(
        Employee,
        verbose_name="Проверил",
        on_delete=models.SET_NULL,
        related_name='checked_shipments',
        null=True,
        blank=True)

    def save(self, *args, **kwargs):
        if not self.number:
            # Get all used numbers for this shipment row
            used_numbers = set(self.shipment_row.items.values_list('number', flat=True))

            if self.shipment_row.order_product:
                max_allowed = self.shipment_row.order_product.quantity

                # Find first available number from 1 to max_allowed
                self.number = next(
                    num for num in range(1, max_allowed + 1)
                    if num not in used_numbers
                )

                if self.number > max_allowed:
                    raise Exception("Номер больше чем количество позиций")
                
        super().save(*args, **kwargs)
    def __str__(self):
        return f'Экземпляр №{self.number} для {self.shipment_row}'


class ShipmentComment(models.Model):
    class Meta:
        verbose_name = 'Комментарий к отгрузке'
        verbose_name_plural = 'Комментарии к отгрузкам'
        ordering = ['-add_date']

    shipment = models.ForeignKey(Shipment,
                                 related_name='shipment_comments',
                                 on_delete=models.CASCADE)
    author = models.ForeignKey(Employee,
                               on_delete=models.CASCADE,
                               verbose_name="Автор",
                               related_name='comment_shipments',
                               blank=True,
                               null=True)

    comment = models.CharField("Комментарий", max_length=255)
    add_date = models.DateTimeField('Дата добавления',
                                    auto_now_add=True,
                                    blank=True,
                                    null=True)

    def __str__(self):
        author_name = self.author if self.author else "Система"
        return f'{author_name}: {self.shipment.id} - {self.comment[:50]}'

