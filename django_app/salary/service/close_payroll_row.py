from datetime import timedelta
from django.db import models

from rest_framework import status
from rest_framework.response import Response

from salary.models import PayrollRow, Payroll, Earning


def payroll_row_close(payroll_row_id: int):

    payroll_row = PayrollRow.objects.get(id=payroll_row_id)

    if payroll_row.start_balance is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    next_payroll = Payroll.objects.filter(
        date_from=payroll_row.payroll.date_to + timedelta(days=1),
    )

    if next_payroll.exists():
        next_payroll_row = PayrollRow.objects.filter(
            user=payroll_row.user,
            payroll=next_payroll.first(),
        )

        if next_payroll_row.exists():
            next_payroll_row = next_payroll_row.first()

            earnings = Earning.objects.filter(
                user=payroll_row.user,
                target_date__gte=payroll_row.payroll.date_from,
                target_date__lte=payroll_row.payroll.date_to,
                approval_by__isnull=False,
            )

            new_sum = earnings.aggregate(total=models.Sum('amount'))['total'] or 0

            next_payroll_row.start_balance = new_sum + payroll_row.start_balance
            next_payroll_row.save()

            earnings.update(is_locked=True)

            Earning.objects.filter(
                user=payroll_row.user,
                target_date__gte=payroll_row.payroll.date_from,
                target_date__lte=payroll_row.payroll.date_to,
                approval_by__isnull=True,
            ).delete()

    payroll_row.is_closed = True
    payroll_row.save()

    payroll_row.refresh_from_db()
    return payroll_row