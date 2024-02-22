from core.models import ProductionStep
from staff.models import Department


def update_production_steps(product):
    """Обновляем этапы производства исходя из изменения JSON схемы технологического процесса"""
    schema = product.technological_process.schema

    # Получаем все текущие этапы производства для данного продукта
    existing_steps = ProductionStep.objects.filter(
        product=product,
    )

    # Создаем или обновляем этапы в соответствии с новой схемой
    for target_department_name, related_department_names in schema.items():
        production_step = ProductionStep.objects.update_or_create(
            department=Department.objects.get(name=target_department_name),
            product=product,
            defaults={
                "is_active": True
            }
        )[0]
        # Чистим все связи этапа
        production_step.next_step.clear()

        for department_name in related_department_names:
            production_step.next_step.add(
                ProductionStep.objects.update_or_create(
                    department=Department.objects.get(name=department_name),
                    product=product,
                    defaults={
                        "is_active": True,
                    }
                )[0].id
            )

        # Отключаем этапы которые не актуальны
        for step in existing_steps:
            if step.department.name not in schema:
                step.is_active = False
                step.save()
