from django.db import models
from core.models import OrderProduct
from staff.models import Employee


class Shipment(models.Model):
    class Meta:
        verbose_name = 'Отгрузка'
        verbose_name_plural = 'Отгрузки'

    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершена'),
        ('canceled', 'Отменена'),
    ]

    status = models.CharField(
        'Статус',
        max_length=50,
        choices=STATUS_CHOICES
    )
    plan_date = models.DateTimeField(
        'Плановая дата отгрузки',
        null=True,
        blank=True,
    )
    comment = models.TextField('Комментарий', blank=True, null=True)

    def __str__(self):
        return f'{self.plan_date}'


class ShipmentRow(models.Model):
    class Meta:
        verbose_name = 'Позиция отгрузки'
        verbose_name_plural = 'Позиции отгрузки'

    order_product = models.ForeignKey(
        OrderProduct,
        on_delete=models.CASCADE,
        verbose_name='Заказанная позиция',
    )
    quantity = models.PositiveIntegerField('Количество', default=1)
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
    )


class ShipmentItem(models.Model):
    class Meta:
        verbose_name = 'Экземпляр позиции'
        verbose_name_plural = 'Экземпляры позиций'

    shipment_row = models.ForeignKey(
        ShipmentRow,
        on_delete=models.CASCADE,
    )
    number = models.PositiveIntegerField('Номер экземпляра', default=1)
    is_reserved = models.BooleanField('Зарезервирован', default=False)
    reserver_id = models.PositiveIntegerField('ID Зарезервированного товара', blank=True, null=True)
    reserved_at = models.DateTimeField('Дата проверки', null=True, blank=True)
    reserved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)

    is_checked = models.BooleanField('Проверен', default=False)
    checked_at = models.DateTimeField('Дата проверки', null=True, blank=True)
    checked_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)


class ShipmentComment(models.Model):
    class Meta:
        verbose_name = 'Комментарий к отгрузке'
        verbose_name_plural = 'Комментарии к отгрузкам'