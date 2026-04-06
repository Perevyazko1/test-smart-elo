from django.db import models


class AiPlanEntry(models.Model):
    """AI-данные для позиции заказа на странице AI-планирования"""

    class Meta:
        verbose_name = 'AI запись плана'
        verbose_name_plural = 'AI записи плана'

    order_product = models.OneToOneField(
        'core.OrderProduct',
        on_delete=models.CASCADE,
        related_name='ai_plan_entry',
        verbose_name='Позиция заказа',
    )
    sort_weight = models.IntegerField('Важность (0-100)', default=50)
    sort_position = models.IntegerField('Позиция в очереди', default=0)
    ai_comment = models.TextField('AI комментарий', blank=True, default='')
    feedback = models.TextField('Обратная связь', blank=True, default='')
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    def __str__(self):
        return f'AI план: {self.order_product}'


class ProductType(models.Model):
    """Тип изделия (Панель, Кресло, Стул, Диван и т.д.)"""

    class Meta:
        verbose_name = 'Тип изделия'
        verbose_name_plural = 'Типы изделий'
        ordering = ['name']

    name = models.CharField('Название', max_length=100, unique=True)

    def __str__(self):
        return self.name


class ProductionNorm(models.Model):
    """Норматив производства: часов на 1 изделие в конкретном цехе"""

    class Meta:
        verbose_name = 'Норматив производства'
        verbose_name_plural = 'Нормативы производства'
        unique_together = ('product_type', 'department')

    DEPARTMENTS = [
        ('Обивка', 'Обивка'),
        ('Крой', 'Крой'),
        ('Пила', 'Пила'),
        ('Сборка', 'Сборка'),
        ('Пошив', 'Пошив'),
        ('Поролон', 'Поролон'),
        ('Лазер', 'Лазер'),
        ('Массив', 'Массив'),
    ]

    product_type = models.ForeignKey(
        ProductType, on_delete=models.CASCADE,
        related_name='norms', verbose_name='Тип изделия',
    )
    department = models.CharField('Цех', max_length=50, choices=DEPARTMENTS)
    hours_per_unit = models.FloatField('Часов на 1 шт', default=0)

    def __str__(self):
        return f'{self.product_type} / {self.department}: {self.hours_per_unit}ч'


class AiPlanConfig(models.Model):
    """Конфигурация AI-планирования (один экземпляр)"""

    class Meta:
        verbose_name = 'Конфигурация AI плана'
        verbose_name_plural = 'Конфигурация AI плана'

    base_prompt = models.TextField('Базовый промпт', default='', blank=True)
    ai_summary = models.TextField('AI сводка', default='', blank=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    def __str__(self):
        return f'AI конфигурация (обновлено: {self.updated_at})'
