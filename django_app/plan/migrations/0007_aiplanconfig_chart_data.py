from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0006_departmentworkers_target_load_days'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiplanconfig',
            name='chart_data',
            field=models.JSONField(blank=True, default=dict, verbose_name='Данные графика'),
        ),
    ]
