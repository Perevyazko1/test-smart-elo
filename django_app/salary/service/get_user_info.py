from datetime import datetime

from staff.models import Employee
from staff.serializers import EmployeeSerializer
from ..models import Earning, PayrollRow
from ..serializers import EarningSerializer, PayrollRowSerializer


def get_user_info(user_id: int, date_from: datetime, date_to: datetime):
    user_info = {}

    employee = Employee.objects.get(id=user_id)
    earnings = Earning.objects.filter(
        user=employee,
    )
    current_earnings = earnings.filter(
        target_date__date__gte=date_from.date(),
        target_date__date__lte=date_to.date(),
    )

    balance = sum(earnings.exclude(
        earning_type__in=["ЗАЙМ", "Внесение НАЛ"]
    ).values_list("amount", flat=True))

    last_payroll_rows = PayrollRow.objects.filter(
        user=employee,
    )[:5]

    user_info["user_info"] = {
        "user": EmployeeSerializer(employee).data,
        "balance": balance,
    }

    user_info["detail_report"] = EarningSerializer(current_earnings, many=True).data
    user_info["week_report"] = PayrollRowSerializer(last_payroll_rows, many=True).data

    return user_info