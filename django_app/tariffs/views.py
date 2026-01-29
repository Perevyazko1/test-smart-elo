import datetime

from django.db import transaction
from rest_framework.decorators import api_view
from django.http import JsonResponse

from core.consumers import EqNotificationActions, ws_group_updates
from core.models import OrderProduct, ProductionStep, Tariff, ProductionStepComment, Assignment, AssignmentCoExecutor, \
    Order
from staff.models import Department, Audit


def normalize_value(value):
    if value is None:
        return None
    if isinstance(value, str):
        val_lower = value.strip().lower()
        if val_lower in ['none', 'null', 'undefined', '']:
            return None
        if val_lower == 'true':
            return True
        if val_lower == 'false':
            return False
    return value


def get_target_departments():
    return list(Department.objects.filter(
        is_industrial=True).exclude(
        number__in=[0, 50]
    ).order_by("ordering"))


def get_tariff_card(op: OrderProduct, departments: list[Department]):
    row = {}
    product = op.product
    row["product"] = product.name
    row["id"] = op.id
    row["series_id"] = op.series_id
    row["confirmed"] = op.tariff_checked
    row["project"] = op.order.project
    picture = product.product_pictures.first()
    row["image"] = picture.image.url if picture else None
    row["amount"] = int(op.price)
    row["quantity"] = op.quantity
    row["fabric"] = op.main_fabric.name if op.main_fabric else "-"

    steps = product.production_steps.filter(is_active=True)
    row.setdefault("steps", {})
    for department in departments:
        step = steps.filter(department=department).first()
        if step:
            row["steps"][department.name] = {
                "amount": step.confirmed_tariff.amount if step.confirmed_tariff else None,
                "proposed_amount": step.proposed_tariff.amount if step.proposed_tariff else None,
                "id": step.id,
            }
        else:
            row["steps"][department.name] = None

    return row


def get_op_filter(project, product, showAll):
    filter_op = {"status": "0"}

    if showAll:
        if product or project:
            filter_op.pop("status")

    if project:
        if project == "Без проекта":
            project = ""
        filter_op["order__project"] = project

    if product:
        filter_op["product__name__icontains"] = product

    print(project, product, showAll)
    print(filter_op)

    return filter_op


@api_view(['GET'])
def get_tariff_rows(request):
    project = normalize_value(request.query_params.get('project'))
    product = normalize_value(request.query_params.get('product'))
    showAll = normalize_value(request.query_params.get('showAll'))

    filter_op = get_op_filter(project, product, showAll)

    target_op = OrderProduct.objects.filter(**filter_op)
    departments = get_target_departments()
    department_names = [d.name for d in departments]

    data = []
    count = 0
    for op in target_op:
        row = get_tariff_card(op, departments)
        data.append(row)
        count += 1
        # if count >= 5:
        #     break

    return JsonResponse({
        "result": data,
        "departments": department_names
    })


@api_view(['POST'])
@transaction.atomic
def update_tariff_data(request):
    step_id = normalize_value(request.data.get('step_id'))
    amount = normalize_value(request.data.get('amount'))

    project = normalize_value(request.data.get('project'))
    product = normalize_value(request.data.get('product'))
    showAll = normalize_value(request.data.get('showAll'))

    filter_op = get_op_filter(project, product, showAll)

    production_step = ProductionStep.objects.get(
        id=step_id,
    )

    new_tariff = Tariff.objects.create(
        amount=amount,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Предложен тариф.'
    )
    production_step.proposed_tariff = new_tariff
    production_step.save()

    detail = f'Предложил тариф в размере {amount} для этапа производства id: {production_step.id}'
    Audit.objects.create(
        employee=request.user,
        details=detail,
    )

    ProductionStepComment.objects.create(
        author=request.user,
        comment=detail,
        production_step=production_step
    )

    """Send update command for EQ page cards. """
    active_order_products = OrderProduct.objects.filter(
        product=production_step.product,
        status="0",
    )

    for order_product in active_order_products:
        notification_data = {str(production_step.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}

        ws_group_updates(
            pin_code="",
            notification_data=notification_data
        )

    ops = OrderProduct.objects.filter(
        **filter_op,
        product=production_step.product,
    )
    print(filter_op)
    print(ops.count())

    departments = get_target_departments()
    data = []
    for op in ops:
        data.append(get_tariff_card(op, departments=departments))
        break

    return JsonResponse({"updated": data})


@api_view(['POST'])
@transaction.atomic
def set_confirmed_tariff(request):
    """Set tariffication. """
    step_id = normalize_value(request.data.get('step_id'))
    showAll = normalize_value(request.data.get('showAll'))

    filter_op = get_op_filter(None, None, showAll)

    production_step = ProductionStep.objects.get(
        id=step_id,
    )

    new_tariff = Tariff.objects.create(
        amount=production_step.proposed_tariff.amount,
        created_by=request.user,
        comment=f'#PS-{production_step.id}# Утвержден тариф. '
    )

    production_step.confirmed_tariff = new_tariff
    production_step.save()

    """Send update command for EQ page cards. """
    active_order_products = OrderProduct.objects.filter(
        product=production_step.product,
        status="0",
    )

    # Циклы разнесены чтобы кеш успевал обновиться
    for order_product in active_order_products:
        assignments_for_update = Assignment.objects.filter(
            order_product=order_product,
            department=production_step.department,
            inspector__isnull=True,
        )
        assignments_for_update.update(
            new_tariff=new_tariff,
            amount=new_tariff.amount,
        )

        AssignmentCoExecutor.objects.filter(
            assignment__in=assignments_for_update
        ).distinct().update(amount=0)

        notification_data = {str(production_step.department.number): {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}

        ws_group_updates(
            pin_code="",
            notification_data=notification_data
        )

    detail = f'Утвердил тариф в размере {new_tariff.amount} для этапа производства id: {production_step.id}'

    Audit.objects.create(
        employee=request.user,
        details=detail,
    )
    ProductionStepComment.objects.create(
        author=request.user,
        comment=detail,
        production_step=production_step
    )

    ops = OrderProduct.objects.filter(
        product=production_step.product,
        **filter_op,
    )
    departments = get_target_departments()
    data = []
    for op in ops:
        data.append(get_tariff_card(op, departments=departments))

    return JsonResponse({"updated": data})


@api_view(['GET'])
def get_projects(request):
    projects = list(
        Order.objects
        .filter(order_products__status=0)
        .distinct('project')
        .values_list('project', flat=True)
    )

    return JsonResponse({"result": projects}, json_dumps_params={"ensure_ascii": False})


@api_view(['POST'])
def confirm_op(request):
    op_id = normalize_value(request.data.get('op_id'))

    op = OrderProduct.objects.get(id=op_id)

    op.tariff_checked = not op.tariff_checked
    op.tariff_checked_by = request.user
    op.tariff_checked_date = datetime.datetime.now()
    op.save()
    op.refresh_from_db()

    departments = get_target_departments()
    data = [get_tariff_card(op, departments=departments)]

    return JsonResponse({"updated": data})
