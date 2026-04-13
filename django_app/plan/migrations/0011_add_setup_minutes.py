# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0010_add_batch_bonus'),
    ]

    operations = [
        migrations.AddField(
            model_name='productionnorm',
            name='setup_minutes',
            field=models.FloatField(
                default=0,
                help_text='Минуты на подготовку при смене типа изделия в цехе. Если тот же тип идёт подряд — 0.',
                verbose_name='Время переключения (мин)',
            ),
        ),
    ]
