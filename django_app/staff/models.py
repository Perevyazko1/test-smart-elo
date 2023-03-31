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
    departments = models.ManyToManyField(Department, related_name='employees', verbose_name='Отделы')

    current_department = models.ForeignKey(
        Department,
        related_name='employees_current',
        blank=True, null=True,
        on_delete=models.SET_NULL
    )

    def __str__(self):
        return self.username
