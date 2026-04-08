from django.db import migrations, models


def set_has_norms(apps, schema_editor):
    Department = apps.get_model('staff', 'Department')
    norms_depts = ['Конструктора', 'Пила', 'Лазер', 'Сборка', 'Столярка', 'Малярка', 'Крой', 'Пошив', 'ППУ', 'Обивка', 'Упаковка']
    Department.objects.filter(name__in=norms_depts).update(has_norms=True)


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0022_employee_api_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='department',
            name='has_norms',
            field=models.BooleanField(default=False, verbose_name='Участвует в нормативах'),
        ),
        migrations.RunPython(set_has_norms, migrations.RunPython.noop),
    ]
