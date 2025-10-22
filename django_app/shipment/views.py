from datetime import datetime
from pprint import pprint
from typing import Optional

from django.http import JsonResponse
from pydantic import BaseModel
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import OrderProduct
from shipment.models import Shipment, ShipmentRow, ShipmentItem, ShipmentComment
from shipment.serializers import ShipmentSerializer


class TCreateShipmentPosition(BaseModel):
    series_id: str
    quantity: int


class TCreateShipment(BaseModel):
    plan_date: Optional[datetime] = None
    positions: Optional[list[TCreateShipmentPosition]] = None
    comment: Optional[str] = ""


@api_view(['POST'])
def create_shipment(request):
    pprint(request.data)

    data: TCreateShipment = TCreateShipment(**request.data)

    shipment = Shipment.objects.create(
        plan_date=data.plan_date,
        comment=data.comment,
        created_by=request.user,
    )

    for position in data.positions:
        order_product = OrderProduct.objects.get(series_id=position.series_id)
        shipment_row = ShipmentRow.objects.create(
            shipment=shipment,
            order_product=order_product,
            quantity=position.quantity,
        )

        for i in range(position.quantity):
            ShipmentItem.objects.create(
                shipment_row=shipment_row,
                order_product=order_product,
            )

    ShipmentComment.objects.create(
        shipment=shipment,
        author=request.user,
        comment=f"Отгрузка создана {datetime.now().strftime('%d.%m.%Y %H:%M')} - {request.user.get_initials()}",
    )
    return JsonResponse({"result": "OK"}, json_dumps_params={"ensure_ascii": False})



class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer