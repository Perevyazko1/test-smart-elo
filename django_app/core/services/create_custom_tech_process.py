from core.models import TechnologicalProcess, Product
from staff.models import Department


def get_target_department_name(schema: dict):
    for key, value in schema.items():
        if key == 'Обивка' or "Обивка" in value:
            return 'Обивка'

    for key, value in schema.items():
        if "Упаковка" in value:
            return key

    for key, value in schema.items():
        if "Готово" in value:
            return key

    raise Exception("Схема не корректна")


def create_and_set_tech_process(schema: dict, product: Product) -> TechnologicalProcess:
    # Проверка наличия технологического процесса с изображением, то есть заготовленного шаблона
    check_usual_schema = TechnologicalProcess.objects.exclude(
        image=''
    ).filter(
        schema=schema
    )

    # Если шаблон есть - выбираем его. Если нет - создаем индивидуальный техпроцесс
    if check_usual_schema.exists():
        tech_process = check_usual_schema[0]
    else:
        final_department = Department.objects.get(
            name=get_target_department_name(schema)
        )
        tech_process = TechnologicalProcess.objects.create(
            name=f'Специальный тех-процесс {product.name}',
            schema=schema,
            final_department=final_department
        )

    # Если ранее был установлен индивидуальный техпроцесс, то он будет удален из БД
    if product.technological_process:
        if product.technological_process.image == '':
            product.technological_process.delete()

    # Привязываем выбранный техпроцесс к соответствующему изделию
    product.technological_process = tech_process
    product.save()

    return tech_process
