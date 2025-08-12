from datetime import datetime
from typing import Optional

from django.db import transaction

from salary.models import Earning, Payroll
from staff.models import Employee


def make_earning(
        user: Employee,
        amount: int,
        target_date: datetime,
        earning_type: str,
        created_by: Employee,
        approval_by: Optional[Employee] = None,
        comment: Optional[str] = None,
        earning_comment: Optional[str] = None,
) -> Earning:

    day = target_date.date()

    payroll_list = Payroll.objects.filter(
        date_from__lte=day,
        date_to__gte=day,
    )

    if payroll_list.exists():
        payroll = payroll_list.first()
        print(int(payroll.state), int(payroll.state) > 1)
        if int(payroll.state) > 1:
            target_date = datetime.now()

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
