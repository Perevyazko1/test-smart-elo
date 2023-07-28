from core.models import TechnologicalProcess, Product
from core.services.update_production_steps import update_production_steps


def create_custom_tech_process(schema: dict, product_id: str) -> TechnologicalProcess:
    product = Product.objects.get(pk=product_id)

    check_usual_schema = TechnologicalProcess.objects.exclude(
        image=''
    ).filter(
        schema=schema
    )

    if check_usual_schema.exists():
        tech_process = check_usual_schema[0]
    else:
        tech_process = TechnologicalProcess.objects.create(
            name=f'Специальный тех-процесс {product.name}',
            schema=schema,
        )

    if product.technological_process:
        if product.technological_process.image == '':
            product.technological_process.delete()

    product.technological_process = tech_process
    product.save()

    update_production_steps(product)

    return tech_process
