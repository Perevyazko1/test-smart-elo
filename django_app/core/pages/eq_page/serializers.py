from rest_framework import serializers

from core.models import OrderProduct, ProductionStep
from core.serializers import ProductSerializer, FabricSerializer, OrderSerializer, AssignmentsSerializer
from core.services.get_week_info import GetWeekInfo


class EQOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tariff = serializers.IntegerField()


class EQCardSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    main_fabric = FabricSerializer(read_only=True)
    second_fabric = FabricSerializer(read_only=True)
    third_fabric = FabricSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    card_info = EQOrderProductInfoSerializer(read_only=True)

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
        status_list: list = self.context.get('status_list')
        view_mode: list = self.context.get('view_mode')
        department_number: list = self.context.get('department_number')

        week = self.context.get('week')
        year = self.context.get('year')

        qs = obj.assignments.all()

        if status_list:
            qs = obj.assignments.filter(
                status=status_list[0],
                department__number=department_number,
            )

        if status_list == ['ready'] and not view_mode == '2':
            week_info = GetWeekInfo(week=week, year=year).execute()
            qs = qs.filter(
                date_completion__gt=week_info.date_range[0],
                date_completion__lte=week_info.date_range[1],
            )

        return AssignmentsSerializer(qs[:50], many=True).data

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
