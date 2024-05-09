"""Views for tariff widget. """
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import ProductionStep, ProductionStepTariff, OrderProduct
from staff.models import Audit

from .serializers import (
    ProductionStepSerializer,
    TariffSerializer,
)
from ...consumers import ws_group_updates, EqNotificationActions, ws_update_notification


@api_view(['GET'])
def get_tariff_card(request):
    """Get tariff card. """
    department__id = request.query_params.get('department__id')
    product__id = request.query_params.get('product__id')

    qs = ProductionStep.objects.get(
        product__id=product__id,
        department__id=department__id,
    )

    data = ProductionStepSerializer(qs).data

    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def set_tariff_card(request):
    """Set tariff card. """
    action = request.data.get('action')
    product_id = request.data.get('product_id')
    department_id = request.data.get('department_id')
    tariff_sum = request.data.get('tariff_sum')

    production_step = ProductionStep.objects.get(
        product__id=product_id,
        department__id=department_id,
    )

    def create_tariff_card(tariff_data):
        """Create tariff method. """
        serializer = TariffSerializer(data=tariff_data)
        if serializer.is_valid():
            instance: ProductionStepTariff = serializer.save()
            production_step.production_step_tariff = instance
            production_step.save()
            create_audit()
            send_notification()
            ws_update_notification(production_step.department.number)
            return Response("ok", status=status.HTTP_201_CREATED)
        else:
            return Response("error", status=status.HTTP_400_BAD_REQUEST)

    def create_audit():
        """Operation audit. """
        detail = (f'{"Предложил тариф" if action == "proposed" else "Утвердил тариф"} в размере {tariff_sum}'
                  f' для этапа производства id: {production_step.id}')
        Audit.objects.create(
            employee=request.user,
            details=detail,
        )

    def send_notification():
        """Send update command for EQ page cards. """
        active_order_products = OrderProduct.objects.filter(
            product__id=product_id,
            status="0"
        )

        for order_product in active_order_products:
            notification_data = {str(request.user.current_department.number): {
                'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                'data': order_product.series_id,
            }}

            ws_group_updates(
                pin_code="",
                notification_data=notification_data
            )

    if production_step.production_step_tariff:
        if action == 'confirm':
            if not production_step.production_step_tariff.proposed_tariff == tariff_sum:
                production_step.production_step_tariff.proposed_tariff = tariff_sum
                production_step.production_step_tariff.proposed_by = request.user

            production_step.production_step_tariff.tariff = tariff_sum
            production_step.production_step_tariff.approved_by = request.user
            production_step.production_step_tariff.save()
            create_audit()
            send_notification()
            ws_update_notification(production_step.department.number)
            return Response("ok", status=status.HTTP_200_OK)

        elif action == 'proposed':
            production_step.production_step_tariff.proposed_tariff = tariff_sum
            production_step.production_step_tariff.proposed_by = request.user
            production_step.production_step_tariff.save()
            create_audit()
            send_notification()
            ws_update_notification(production_step.department.number)
            return Response("ok", status=status.HTTP_200_OK)

        else:
            return Response("error", status=status.HTTP_400_BAD_REQUEST)
    else:
        data = {
            "product_id": product_id,
            "department_id": department_id,
            "proposed_by_id": request.user.id,
            "proposed_tariff": tariff_sum,
        }

        if action == 'confirm':
            data['approved_by_id'] = request.user.id
            data['tariff'] = tariff_sum
            return create_tariff_card(data)

        elif action == 'proposed':
            return create_tariff_card(data)

        else:
            return Response("error", status=status.HTTP_400_BAD_REQUEST)
