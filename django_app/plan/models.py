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
    sort_weight = models.IntegerField('Важность (0-1000)', default=500)
    weight_detail = models.JSONField('Разбивка веса', default=dict, blank=True)
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
    workflow_graph = models.JSONField('Граф цехов', default=dict, blank=True)

    def __str__(self):
        return self.name


class ProductionNorm(models.Model):
    """Норматив производства: часов на 1 изделие в конкретном цехе"""

    class Meta:
        verbose_name = 'Норматив производства'
        verbose_name_plural = 'Нормативы производства'
        unique_together = ('product_type', 'department')

    product_type = models.ForeignKey(
        ProductType, on_delete=models.CASCADE,
        related_name='norms', verbose_name='Тип изделия',
    )
    department = models.CharField('Цех', max_length=50)
    hours_per_unit = models.FloatField('Часов на 1 шт', default=0)

    def __str__(self):
        return f'{self.product_type} / {self.department}: {self.hours_per_unit}ч'


class ProductNormOverride(models.Model):
    """Переопределение норматива для конкретного изделия (Product)"""

    class Meta:
        verbose_name = 'Переопределение норматива'
        verbose_name_plural = 'Переопределения нормативов'
        unique_together = ('product', 'department')

    product = models.ForeignKey(
        'core.Product', on_delete=models.CASCADE,
        related_name='norm_overrides', verbose_name='Изделие',
    )
    department = models.CharField('Цех', max_length=50)
    hours_per_unit = models.FloatField('Часов на 1 шт')

    def __str__(self):
        return f'{self.product} / {self.department}: {self.hours_per_unit}ч (override)'


class DepartmentWorkers(models.Model):
    """Количество рабочих в цехе"""

    class Meta:
        verbose_name = 'Рабочие в цехе'
        verbose_name_plural = 'Рабочие в цехах'

    department = models.CharField('Цех', max_length=50, unique=True)
    workers_count = models.IntegerField('Количество рабочих', default=1)
    target_load_days = models.IntegerField('Целевая загрузка (дни)', default=7)

    def __str__(self):
        return f'{self.department}: {self.workers_count} чел.'


class AiPlanConfig(models.Model):
    """Конфигурация AI-планирования (один экземпляр)"""

    class Meta:
        verbose_name = 'Конфигурация AI плана'
        verbose_name_plural = 'Конфигурация AI плана'

    base_prompt = models.TextField('Базовый промпт', default='', blank=True)
    ai_summary = models.TextField('AI сводка', default='', blank=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    # Weight coefficients (sliders 0-50)
    weight_k_deadline = models.IntegerField('K сроки', default=15)
    weight_k_progress = models.IntegerField('K прогресс', default=25)
    weight_k_dept_load = models.IntegerField('K загрузка цехов', default=40)
    weight_k_feedback = models.IntegerField('K обратная связь', default=35)

    # Кэш данных для графика загрузки цехов (ai-plan-chart).
    # Заполняется при генерации AI-плана в Celery, фронт забирает готовое.
    chart_data = models.JSONField('Данные графика', default=dict, blank=True)

    # Task tracking
    task_id = models.CharField('Celery Task ID', max_length=255, blank=True, default='')
    task_status = models.CharField('Статус задачи', max_length=20, default='idle')
    task_progress = models.IntegerField('Обработано заказов', default=0)
    task_total = models.IntegerField('Всего заказов', default=0)
    task_phase = models.CharField('Фаза', max_length=100, blank=True, default='')
    task_error = models.TextField('Ошибка', blank=True, default='')

    def __str__(self):
        return f'AI конфигурация (обновлено: {self.updated_at})'
