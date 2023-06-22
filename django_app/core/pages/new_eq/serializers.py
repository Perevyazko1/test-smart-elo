from rest_framework import serializers

from core.models import OrderProduct, ProductionStep
from core.serializers import ProductSerializer, FabricSerializer, OrderSerializer, AssignmentsSerializer


class EqOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tariff = serializers.IntegerField()


class EqCardSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    main_fabric = FabricSerializer(read_only=True)
    second_fabric = FabricSerializer(read_only=True)
    third_fabric = FabricSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    assignments = serializers.SerializerMethodField()
    card_info = EqOrderProductInfoSerializer(read_only=True)

    class Meta:
        model = OrderProduct
        fields = [
            'id',
            'series_id',
            'product',
            'main_fabric',
            'second_fabric',
            'third_fabric',
            'order',
            'urgency',
            'comment_base',
            'comment_case',
            'assignments',
            'card_info',
        ]
        read_only_fields = [
            'series_id'
        ]

    def get_assignments(self, obj):
        status_list: list = ['await', 'in_work', 'ready']
        department_number: list = self.context.get('department_number')

        assignments = obj.assignments.filter(
            department__number=department_number
        ).distinct()

        results = []

        for status in status_list:
            qs = assignments.filter(status=status)
            match status:
                case 'await':
                    pass
                case 'in_work':
                    pass
                case 'ready':
                    pass
            results.extend(AssignmentsSerializer(qs, many=True).data)

        return results

    def get_count_data(self, obj: OrderProduct):
        department_number = self.context.get('department_number')

        target_production_step = ProductionStep.objects.filter(
            product=obj.product,
            department__number=department_number
        )

        if target_production_step.exists():
            production_step = target_production_step[0]

            if production_step.production_step_tariff:
                tariff = production_step.production_step_tariff.tariff
            else:
                tariff = 0

            queryset = obj.assignments.filter(department__number=department_number)
            in_work_count = queryset.filter(status='in_work').count(),

            ready_count = queryset.filter(status='ready').count(),
            await_count = queryset.filter(status='await').count(),
        else:
            tariff = 0
            in_work_count = 0
            ready_count = 0
            await_count = 0

        count_all = obj.quantity,

        return (
            tariff,
            count_all[0],
            in_work_count,
            ready_count,
            await_count
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tariff, count_all, count_in_work, count_ready, count_await = self.get_count_data(instance)

        representation['count_all'] = count_all
        representation['count_in_work'] = count_in_work
        representation['count_ready'] = count_ready
        representation['count_await'] = count_await
        representation['tariff'] = tariff

        return representation
