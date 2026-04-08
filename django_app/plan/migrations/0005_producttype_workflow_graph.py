from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0004_add_weight_coefficients'),
    ]

    operations = [
        migrations.AddField(
            model_name='producttype',
            name='workflow_graph',
            field=models.JSONField(blank=True, default=dict, verbose_name='Граф цехов'),
        ),
    ]
