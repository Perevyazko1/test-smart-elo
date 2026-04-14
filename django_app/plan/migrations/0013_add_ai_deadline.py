from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0012_refactor_batch_setup'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiplanentry',
            name='ai_deadline',
            field=models.DateField('AI дедлайн', null=True, blank=True),
        ),
    ]
