# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0051_add_product_production_type'),
        ('staff', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_date', models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')),
                ('deleted', models.BooleanField(default=False, verbose_name='Удалено')),
                ('text', models.CharField(max_length=255, verbose_name='Комментарий')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='staff.employee', verbose_name='Автор')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_comments', to='core.order', verbose_name='Заказ')),
            ],
            options={
                'verbose_name': 'Комментарий к заказу',
                'verbose_name_plural': 'Комментарии к заказам',
                'ordering': ['-add_date'],
            },
        ),
        migrations.CreateModel(
            name='AgentComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_date', models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')),
                ('deleted', models.BooleanField(default=False, verbose_name='Удалено')),
                ('text', models.CharField(max_length=255, verbose_name='Комментарий')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='staff.employee', verbose_name='Автор')),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='agent_comments', to='core.agent', verbose_name='Заказчик')),
            ],
            options={
                'verbose_name': 'Комментарий к заказчику',
                'verbose_name_plural': 'Комментарии к заказчикам',
                'ordering': ['-add_date'],
            },
        ),
    ]
