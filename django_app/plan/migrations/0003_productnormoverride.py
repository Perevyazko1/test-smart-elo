import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('plan', '0002_aiplanconfig_task_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductNormOverride',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.CharField(max_length=50, verbose_name='Цех')),
                ('hours_per_unit', models.FloatField(verbose_name='Часов на 1 шт')),
                ('product', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='norm_overrides',
                    to='core.product',
                    verbose_name='Изделие',
                )),
            ],
            options={
                'verbose_name': 'Переопределение норматива',
                'verbose_name_plural': 'Переопределения нормативов',
                'unique_together': {('product', 'department')},
            },
        ),
    ]
