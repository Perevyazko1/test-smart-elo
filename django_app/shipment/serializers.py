from rest_framework import serializers

from core.serializers import OrderProductSerializer
from .models import Shipment, ShipmentRow, ShipmentComment, ShipmentItem


class ShipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentItem
        fields = [
            'id',
            'number',
            'is_reserved',
            'reserver_id',
            'reserved_at',
            'is_checked',
            'checked_at',
        ]


class ShipmentRowSerializer(serializers.ModelSerializer):
    items = ShipmentItemSerializer(many=True, read_only=True)
    order_product = OrderProductSerializer()

    class Meta:
        model = ShipmentRow
        fields = [
            'id',
            'order_product',
            'quantity',
            'items'
        ]


class ShipmentCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentComment
        fields = [
            'id',
            'author',
            'comment',
            'add_date'
        ]


class ShipmentSerializer(serializers.ModelSerializer):
    rows = ShipmentRowSerializer(many=True, read_only=True)
    shipment_comments = ShipmentCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id',
            'status',
            'plan_date',
            'comment',
            'created_at',
            'created_by',
            'rows',
            'shipment_comments'
        ]
