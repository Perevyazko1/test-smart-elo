from core.models import TechnologicalProcess, OrderProduct
from staff.models import Employee


def create_custom_tech_process(schema: dict, series_id: str) -> TechnologicalProcess:
    order_product = OrderProduct.objects.get(series_id=series_id)

    check_usual_schema = TechnologicalProcess.objects.exclude(
        image=''
    ).filter(
        schema=schema
    )

    if check_usual_schema.exists():
        tech_process = check_usual_schema[0]
    else:
        tech_process = TechnologicalProcess.objects.create(
            name=f'Специальный тех-процесс {order_product.product.name}',
            schema=schema,
        )

    if order_product.product.technological_process:
        if order_product.product.technological_process.image == '':
            order_product.product.technological_process.delete()

    order_product.product.technological_process = tech_process
    order_product.product.save()

    return tech_process
