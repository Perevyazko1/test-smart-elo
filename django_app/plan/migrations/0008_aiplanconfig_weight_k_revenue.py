# Добавляет коэффициент "Выручка" в настройки приоритетов AI-плана.
# По умолчанию 0 — поведение не меняется пока менеджер не включит слайдер.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0007_aiplanconfig_chart_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiplanconfig',
            name='weight_k_revenue',
            field=models.IntegerField(default=0, verbose_name='K выручка'),
        ),
    ]
