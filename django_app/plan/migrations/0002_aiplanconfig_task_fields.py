from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_id',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Celery Task ID'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_status',
            field=models.CharField(default='idle', max_length=20, verbose_name='Статус задачи'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_progress',
            field=models.IntegerField(default=0, verbose_name='Обработано заказов'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_total',
            field=models.IntegerField(default=0, verbose_name='Всего заказов'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_phase',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='Фаза'),
        ),
        migrations.AddField(
            model_name='aiplanconfig',
            name='task_error',
            field=models.TextField(blank=True, default='', verbose_name='Ошибка'),
        ),
    ]
