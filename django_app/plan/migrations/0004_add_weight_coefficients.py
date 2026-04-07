from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0003_productnormoverride'),
    ]

    operations = [
        # AiPlanEntry: sort_weight 0-1000 + weight_detail JSON
        migrations.AlterField(
            model_name='aiplanentry',
            name='sort_weight',
            field=models.IntegerField(default=500, verbose_name='Важность (0-1000)'),
        ),
        migrations.AddField(
            model_name='aiplanentry',
            name='weight_detail',
            field=models.JSONField(blank=True, default=dict, verbose_name='Разбивка веса'),
        ),
        # AiPlanConfig: weight coefficients
        migrations.AddField(
            model_name='aiplanconfig',
            name='weight_k_deadline',
            field=models.IntegerField(default=15, verbose_name='K сроки'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='weight_k_progress',
            field=models.IntegerField(default=25, verbose_name='K прогресс'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='weight_k_dept_load',
            field=models.IntegerField(default=40, verbose_name='K загрузка цехов'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='weight_k_feedback',
            field=models.IntegerField(default=35, verbose_name='K обратная связь'),
        ),
    ]
