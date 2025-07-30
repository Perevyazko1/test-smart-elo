from datetime import date

from staff.models import Employee
from staff.serializers import EmployeeSerializer
from ..models import Earning
from ..serializers import EarningSerializer


def get_user_info(user_id: int, date_from: date, date_to: date):
    user_info = {}

    employee = Employee.objects.get(id=user_id)
    earnings = Earning.objects.filter(
        user=employee,
    )
    current_earnings = earnings.filter(
        target_date__gte=date_from,
        target_date__lte=date_to,
    )

    last_week_earnings = Earning.objects.filter(
        user=employee,
        # approval_by__isnull=False,
    )[:200]

    user_info["user_info"] = {
        "user": EmployeeSerializer(employee).data,
        "balance": sum(earnings.values_list("amount", flat=True)),
    }

    user_info["detail_report"] = EarningSerializer(current_earnings, many=True).data

    user_info["week_report"] = EarningSerializer(last_week_earnings, many=True).data

    return user_info