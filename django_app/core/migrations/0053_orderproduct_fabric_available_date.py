from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0052_ordercomment_agentcomment'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderproduct',
            name='fabric_available_date',
            field=models.DateField(blank=True, null=True, verbose_name='Дата получения ткани'),
        ),
    ]
