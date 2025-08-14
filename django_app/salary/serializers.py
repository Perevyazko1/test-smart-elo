from rest_framework import serializers
from salary.models import Earning, PayrollRow, Payroll
from staff.serializers import EmployeeSerializer


class EarningSerializer(serializers.ModelSerializer):
    approval_by_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    user = EmployeeSerializer(read_only=True)
    user_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Earning
        fields = [
            'id',
            'user',
            'user_id',
            'is_locked',
            'amount',
            'earning_type',
            'target_date',
            'cash_date',
            'created_at',
            'created_by',
            'created_by_name',
            'comment',
            'earning_comment',
            'approval_by',
            'approval_by_name',
        ]

    def get_approval_by_name(self, obj: Earning):
        return str(obj.approval_by)

    def get_created_by_name(self, obj: Earning):
        return str(obj.created_by)


from rest_framework import serializers


class PayrollRowSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    user = EmployeeSerializer()
    week = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    has_unconfirmed = serializers.BooleanField(source='annotated_has_unconfirmed')
    hide_balance = serializers.BooleanField(source='annotated_hide_balance')

    # Использование IntegerField вместо DecimalField
    tax_sum = serializers.IntegerField(source='annotated_tax_sum', allow_null=True)
    card_sum = serializers.IntegerField(source='annotated_card_sum', allow_null=True)
    earned_sum = serializers.IntegerField(source='annotated_earned_sum', allow_null=True)
    bonus_sum = serializers.IntegerField(source='annotated_bonus_sum', allow_null=True)
    issued_sum = serializers.IntegerField(source='annotated_issued_sum', allow_null=True)
    ip_sum = serializers.IntegerField(source='annotated_ip_sum', allow_null=True)
    loan_sum = serializers.IntegerField(source='annotated_loan_sum', allow_null=True)
    balance_sum = serializers.IntegerField(source='annotated_balance_sum', allow_null=True)
    full_loan_sum = serializers.IntegerField(source='annotated_full_loan_sum', allow_null=True)
    end_loan_sum = serializers.IntegerField(source='annotated_end_loan_sum', allow_null=True)

    class Meta:
        model = PayrollRow
        fields = [
            'id', 'name', 'payroll', 'user', 'week', 'is_locked', 'is_closed', 'comment',
            'issued_sum', 'ip_sum', 'tax_sum', 'card_sum', 'balance_sum',
            'cash_payout', 'card_payout', 'ip_payout', 'tax_payout', 'loan_payout',
            'earned_sum', 'bonus_sum', 'department_name', 'has_unconfirmed',
            'hide_balance', 'full_loan_sum', 'end_loan_sum', 'loan_sum',
        ]

    def get_name(self, obj):
        return str(obj.user)

    def get_week(self, obj):
        return obj.payroll.name

    def get_department_name(self, obj):
        return obj.user.permanent_department.name if obj.user.permanent_department else None


class PayrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = [
            'id',
            'state',
            'date_from',
            'date_to',
            'cash_payout',
            'is_closed',
            'description',
            'name',
        ]