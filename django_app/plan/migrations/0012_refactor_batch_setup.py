# Рефакторинг: настил → по цеху, переключение → глобальное значение в AiPlanConfig

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0011_add_setup_minutes'),
    ]

    operations = [
        # 1. Новая модель DepartmentBatchBonus — настил привязан к цеху, не к типу изделия
        migrations.CreateModel(
            name='DepartmentBatchBonus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.CharField(max_length=50, unique=True, verbose_name='Цех')),
                ('batch_bonus', models.FloatField(
                    default=0,
                    help_text='Доля ускорения при серии одинаковых изделий. Например 0.30 = на 30% быстрее когда подряд одинаковые.',
                    verbose_name='Настил (0.0-0.5)',
                )),
            ],
            options={
                'verbose_name': 'Настил по цеху',
                'verbose_name_plural': 'Настил по цехам',
            },
        ),
        # 2. Глобальное время переключения в AiPlanConfig
        migrations.AddField(
            model_name='aiplanconfig',
            name='setup_minutes',
            field=models.FloatField(default=0, verbose_name='Время переключения (мин)'),
        ),
    ]
