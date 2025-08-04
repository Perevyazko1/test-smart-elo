from datetime import date, datetime
from typing import Optional

from django.db import transaction

from salary.models import Earning, Payroll
from staff.models import Employee


def make_earning(
        user: Employee,
        amount: int,
        target_date: date,
        earning_type: str,
        created_by: Employee,
        approval_by: Optional[Employee] = None,
        comment: Optional[str] = None,
        earning_comment: Optional[str] = None,
) -> Earning:
    payroll_list = Payroll.objects.filter(
        date_to__lte=target_date,
        date_from__gte=target_date,
    )
    
    if payroll_list.exists():
        payroll = payroll_list.first()
        if int(payroll.state) < 2:
            target_date = datetime.now().date()

    with transaction.atomic():
        earning = Earning.objects.create(
            user=user,
            amount=amount * 100,
            target_date=target_date,
            earning_type=earning_type,
            comment=comment,
            created_by=created_by,
            approval_by=approval_by,
            earning_comment=earning_comment,
            is_locked=earning_type == "ЭЛО",
        )

        return earning
