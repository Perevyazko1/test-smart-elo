from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0005_producttype_workflow_graph'),
    ]

    operations = [
        migrations.AddField(
            model_name='departmentworkers',
            name='target_load_days',
            field=models.IntegerField(default=7, verbose_name='Целевая загрузка (дни)'),
        ),
    ]
