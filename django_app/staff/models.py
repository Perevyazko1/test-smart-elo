import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

from staff.service import validate_color


class Department(models.Model):
    """Класс хранящий данные об отделах. У каждого отдела свой уникальный номер"""
    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'

    name = models.CharField('Наименование отдела', max_length=150, unique=True)
    number = models.PositiveSmallIntegerField('Номер отдела', default=0, unique=True)

    single = models.BooleanField('Отдел разово участвует в производстве', blank=True)
    piecework_wages = models.BooleanField('В отделе установлена сдельная оплата труда', default=False)
    color = models.CharField(max_length=9, validators=[validate_color], default='#ffffff')
    is_industrial = models.BooleanField('Отдел производственный', blank=True, default=True)

    def __str__(self):
        return '{}'.format(f'№{self.number} - {self.name}')


class Employee(AbstractUser):
    """Переопределение стандартного пользователя, дополнен пин-кодом для верификации и отделом производства"""
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    # Пин код для входа в приложение
    pin_code = models.CharField('Пин код для входа', max_length=6, unique=True)
    # Принадлежность к отделу. По этому параметру определяется выгрузка нарядов в приложение.
    departments = models.ManyToManyField(Department, related_name='employees', verbose_name='Отделы', blank=True)
    patronymic = models.CharField('Отчество', max_length=256, blank=True, null=True)

    boss = models.ForeignKey(
        'Employee',
        verbose_name='Кому подчиняется',
        related_name='boss_for',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    favorite_users = models.ManyToManyField(
        'Employee',
        verbose_name='Избранные пользователи',
        related_name='favorites',
        blank=True
    )

    current_department = models.ForeignKey(
        Department,
        related_name='employees_current',
        verbose_name="Текущий отдел",
        blank=True, null=True,
        on_delete=models.SET_NULL,
    )
    permanent_department = models.ForeignKey(
        Department,
        related_name='employees_permanent',
        verbose_name="Постоянный отдел",
        blank=True, null=True,
        on_delete=models.SET_NULL,
    )
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.CharField('Описание', max_length=250, blank=True, null=True)

    def __str__(self):
        if self.first_name:
            return '{}'.format(f'{self.first_name} {self.last_name}')
        return self.username


class Transaction(models.Model):

    """Класс сохраняющий финансовые транзакции касаемо сотрудников"""
    class Meta:
        verbose_name = 'Финансовые транзакция'
        verbose_name_plural = 'Финансовые транзакции'

    # Виды транзакций
    TYPE_CHOICES = [
        ("cash", "Выдача НАЛ"),
        ("card", "Выдача на карту"),
        ("tax", "Налог"),
        ("accrual", "Начисление"),
        ("debiting", "Списание"),
    ]

    # Детализация платежей
    DETAILS_CHOICES = [
        ("purchase", "Чек/Закупка"),
        ("wages", "ЗП"),
        ("prize", "Премия"),
        ("fine", "Штраф"),
        ("loan", "Займ"),
        ("adjustment", "Корректировка"),
        ("other", "Другое"),
    ]

    add_date = models.DateTimeField(
        'Дата / Время создания',
        auto_now_add=True,
    )

    transaction_type = models.CharField('Тип', max_length=50, choices=TYPE_CHOICES, default="cash")
    details = models.CharField('Детализация', max_length=50, choices=DETAILS_CHOICES, default="wages")

    amount = models.DecimalField('Сумма', max_digits=10, decimal_places=2, default=0.00)
    starting_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    ending_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    employee = models.ForeignKey(
        Employee,
        verbose_name='Получил',
        related_name='transactions_employee',
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )
    executor = models.ForeignKey(
        Employee,
        verbose_name='Провел',
        related_name='transactions_executor',
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )

    inspector = models.ForeignKey(
        Employee,
        verbose_name='Проверяющий',
        related_name='transactions_inspector',
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )
    inspect_date = models.DateTimeField(
        'Дата / Время визирования',
        blank=True,
        null=True,
    )

    description = models.CharField('Описание', max_length=250, blank=True, null=True)

    is_locked = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_locked:
            raise ValidationError("This transaction is locked and cannot be edited.")

        if self.amount and self.inspector:
            self.starting_balance = self.employee.current_balance
            if self.transaction_type == 'accrual':
                self.ending_balance = self.employee.current_balance + self.amount
                self.employee.current_balance += self.amount
            else:
                self.ending_balance = self.employee.current_balance - self.amount
                self.employee.current_balance -= self.amount
            self.employee.save()
            self.inspect_date = datetime.datetime.now()
            self.is_locked = True  # блокировка модели для редактирования
        super(Transaction, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(f'{self.amount} || {self.add_date.strftime("%m.%d.%Y - %H:%M")} в пользу {self.executor}')


class Audit(models.Model):
    """Класс для сохранения истории действий пользователя"""
    class Meta:
        verbose_name = 'Действие пользователя'
        verbose_name_plural = 'Действия пользователей'

    TYPE_CHOICES = [
        ("error", "Ошибка"),
        ("edit", "Изменения"),
        ("authentication", "Аутентификация"),
        ("other", "Другое"),
    ]

    date = models.DateTimeField('Дата / Время действия', auto_now=True)
    employee = models.ForeignKey(
        Employee,
        verbose_name='Пользователь',
        related_name='audits',
        on_delete=models.CASCADE,
    )
    audit_type = models.CharField('Тип события', max_length=250, choices=TYPE_CHOICES, default='edit')
    details = models.TextField('Детали', max_length=5000)

    def __str__(self):
        return '{}'.format(f'{self.date.strftime("%m.%d.%Y - %H:%M")} '
                           f'| {self.employee.first_name} {self.employee.last_name} | {self.get_audit_type_display()} |'
                           f' {self.details[:100]}')
