# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0009_add_product_production_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='productionnorm',
            name='batch_bonus',
            field=models.FloatField(
                default=0,
                help_text='Доля ускорения при серии одинаковых изделий (0.0-0.5). Например 0.30 = на 30% быстрее когда подряд идут одинаковые изделия.',
                verbose_name='Настил (бонус серии)',
            ),
        ),
    ]
