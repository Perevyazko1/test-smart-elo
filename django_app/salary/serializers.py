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


class PayrollRowSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    user = EmployeeSerializer()
    week = serializers.SerializerMethodField()
    tax_sum = serializers.SerializerMethodField()
    full_loan_sum = serializers.SerializerMethodField()
    end_loan_sum = serializers.SerializerMethodField()
    loan_sum = serializers.SerializerMethodField()
    issued_sum = serializers.SerializerMethodField()
    ip_sum = serializers.SerializerMethodField()
    card_sum = serializers.SerializerMethodField()
    earned_sum = serializers.SerializerMethodField()
    bonus_sum = serializers.SerializerMethodField()
    balance_sum = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    hide_balance = serializers.SerializerMethodField()

    has_unconfirmed = serializers.SerializerMethodField()

    class Meta:
        model = PayrollRow
        fields = [
            'id',
            'name',
            'payroll',
            'user',
            'week',
            'is_locked',
            'is_closed',
            'comment',
            'issued_sum',
            'ip_sum',
            'tax_sum',
            'card_sum',
            'balance_sum',

            'cash_payout',
            'card_payout',
            'ip_payout',
            'tax_payout',
            'loan_payout',

            'earned_sum',
            'bonus_sum',
            'department_name',
            'has_unconfirmed',
            'hide_balance',
            'full_loan_sum',
            'end_loan_sum',
            'loan_sum',
        ]

    def get_name(self, obj):
        return str(obj.user)

    def get_week(self, obj):
        return obj.payroll.name

    def get_department_name(self, obj):
        return obj.user.permanent_department.name if obj.user.permanent_department else None

    def get_tax_sum(self, obj):
        return obj.annotated_tax_sum or None

    def get_balance_sum(self, obj: PayrollRow):
        return obj.annotated_balance_sum or None

    def get_card_sum(self, obj):
        return obj.annotated_card_sum or None

    def get_earned_sum(self, obj):
        return obj.annotated_earned_sum or None

    def get_bonus_sum(self, obj):
        return obj.annotated_bonus_sum or None

    def get_issued_sum(self, obj):
        return obj.annotated_issued_sum or None

    def get_ip_sum(self, obj):
        return obj.annotated_ip_sum or None

    def get_full_loan_sum(self, obj):
        return obj.annotated_full_loan_sum or None

    def get_end_loan_sum(self, obj):
        return obj.annotated_end_loan_sum or None

    def get_loan_sum(self, obj):
        return obj.annotated_loan_sum or None

    def get_has_unconfirmed(self, obj):
        return obj.annotated_has_unconfirmed

    def get_hide_balance(self, obj):
        return obj.annotated_hide_balance


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