from django.contrib.auth.models import AbstractUser
from django.db import models

from staff.service import validate_color


class Department(models.Model):
    """Класс хранящий данные об отделах. У каждого отдела свой уникальный номер"""
    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'

    name = models.CharField('Наименование отдела', max_length=150, unique=True)
    number = models.PositiveSmallIntegerField('Номер отдела', default=0, unique=True)
    ordering = models.PositiveSmallIntegerField('Сортировка', default=0)

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
        ordering = ['last_name', 'first_name']

    api_id = models.UUIDField('API ID', blank=True, null=True)
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

    kpd = models.DecimalField('КПД Сотрудника', max_digits=4, decimal_places=2, default=1.00)
    description = models.CharField('Описание', max_length=250, blank=True, null=True)

    piecework_wages = models.BooleanField('Сдельная форма оплаты труда', default=True)
    piecework_amount = models.PositiveIntegerField('Тариф в час', default=0, blank=True, null=True)

    attention = models.BooleanField(default=False)

    def __str__(self):
        if self.first_name and self.last_name:
            return '{}'.format(f'{self.last_name} {self.first_name}')
        return self.username

    def get_initials(self):
        f = self.first_name[0] if self.first_name else '_'
        l = self.last_name[0] if self.last_name else '_'
        p = self.patronymic[0] if self.patronymic else '_'
        return f'{l}{f}{p}'


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
