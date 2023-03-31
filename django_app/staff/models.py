from django.db import models
from django.contrib.auth.models import AbstractUser


class Department(models.Model):
    """Класс хранящий данные об отделах. У каждого отдела свой уникальный номер"""
    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'

    name = models.CharField('Наименование отдела', max_length=150, unique=True)
    number = models.PositiveSmallIntegerField('Номер отдела', default=0, unique=True)

    single = models.BooleanField('Отдел разово участвует в производстве', blank=True)
    piecework_wages = models.BooleanField('В отделе установлена сдельная оплата труда', default=False)

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

    current_department = models.ForeignKey(
        Department,
        related_name='employees_current',
        blank=True, null=True,
        on_delete=models.SET_NULL
    )

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
    ]

    commit_date = models.DateTimeField('Дата проведения', auto_now_add=True)
    transaction_type = models.CharField('Тип', max_length=50, choices=TYPE_CHOICES, default="cash")
    details = models.CharField('Детализация', max_length=50, choices=DETAILS_CHOICES, default="wages")
    amount = models.DecimalField('Сумма', max_digits=9, decimal_places=2, default=0.00)

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

    def __str__(self):
        return '{}'.format(
            f'{self.amount} ₽ '
            f'Неделя {self.commit_date.strftime("%U")} '
            f'({self.commit_date.strftime("%d.%m")}) '
            f'{self.get_transaction_type_display()} '
            f'{self.get_details_display()} '
            f'в пользу {self.employee}')
