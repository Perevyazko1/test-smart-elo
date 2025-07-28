from django.db import models

from staff.models import Employee


class Payroll(models.Model):
    class Meta:
        verbose_name = 'Ведомость'
        verbose_name_plural = 'Ведомости'
        ordering = ['-id']

    name = models.CharField('Наименование', max_length=250, blank=True, unique=True)

    """Начисление, Проверка, Бюджет, К выплате, Выплата, Закрыта"""
    state = models.CharField('Статус', max_length=250, blank=True, choices=[
        ('1', 'Начисление'),
        ('2', 'Проверка'),
        ('3', 'Бюджет'),
        ('4', 'К выплате'),
        ('5', 'Выплата'),
        ('6', 'Закрыта'),
    ], null=True)
    date_from = models.DateField('Период с', blank=True, null=True)
    date_to = models.DateField('Период по', blank=True, null=True)

    cash_payout = models.IntegerField('Согласованная сумма к выдаче', default=0)

    is_closed = models.BooleanField('Период закрыт', default=False)

    description = models.TextField('Заметки', blank=True, null=True)

    crated_at = models.DateTimeField(
        'Дата добавления',
        auto_now_add=True,
        blank=True,
        null=True
    )

    def __str__(self):
        return '{}'.format(f'{self.name}')


class PayrollRow(models.Model):
    class Meta:
        verbose_name = 'Позиция ведомости'
        verbose_name_plural = 'Позиции ведомостей'
        unique_together = ['payroll', 'user']
        ordering = ['-id']

    payroll = models.ForeignKey(
        Payroll,
        verbose_name="Ведомость",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        Employee,
        verbose_name="Работник",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payroll_rows'
    )

    comment = models.TextField('Комментарий', blank=True, null=True)

    start_balance = models.IntegerField(
        'Баланс на начало периода',
        default=0,
        blank=True,
        null=True,
    )

    cash_payout = models.IntegerField('Сумма к выдаче НАЛ', default=0)
    cash_approval = models.BooleanField('Сумма к выдаче НАЛ согласована', default=False)

    is_locked = models.BooleanField('Блокировка начислений', default=False)
    is_closed = models.BooleanField('Период закрыт', default=False)

    def __str__(self):
        return '{}'.format(f'{self.payroll.date_from.day} - {self.user.first_name} {self.user.last_name}')


class Earning(models.Model):
    class Meta:
        verbose_name = 'Начисление'
        verbose_name_plural = 'Начисления'
        ordering = ['-target_date', '-id']

    user = models.ForeignKey(
        Employee,
        verbose_name="Работник",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='earnings'
    )

    crated_at = models.DateTimeField(
        'Дата добавления',
        auto_now_add=True,
        blank=True,
        null=True
    )

    target_date = models.DateField(
        'Дата закрепления',
        null=True,
        blank=True,
    )

    amount = models.IntegerField('Сумма', default=0)

    """Выдача НАЛ, На карту, Налог, ЭЛО, ДОП, Внесение НАЛ, ЗАЙМ, ПОГ.ЗАЙМА"""
    earning_type = models.CharField('Тип', max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(
        Employee,
        verbose_name="Кто создал",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='earnings_created'
    )
    approval_by = models.ForeignKey(
        Employee,
        verbose_name="Кто согласовал",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='earnings_approved'
    )

    comment = models.TextField('Комментарий', blank=True, null=True)
    earning_comment = models.TextField('Комментарий зарплатный', blank=True, null=True)

    is_locked = models.BooleanField('Не редактируемый', default=False)

    def __str__(self):
        return '{}'.format(
            f'{self.earning_type} - '
            f'{self.target_date.day} - '
            f'{self.amount} - '
            f'{self.user.first_name} '
            f'{self.user.last_name}'
        )
