from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0013_add_ai_deadline'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiplanconfig',
            name='needs_recalculation',
            field=models.BooleanField('Требуется пересчёт', default=False),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='last_recalculated_at',
            field=models.DateTimeField('Последний пересчёт', null=True, blank=True),
        ),
    ]
