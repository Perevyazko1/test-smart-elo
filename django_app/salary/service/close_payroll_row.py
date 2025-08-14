from salary.models import PayrollRow, Earning
from salary.utils import annotate_payroll_rows


def payroll_row_close(payroll_row_id: int, close: bool):
    payroll_row = PayrollRow.objects.get(id=payroll_row_id)

    earnings = Earning.objects.filter(
        user=payroll_row.user,
        target_date__gte=payroll_row.payroll.date_from,
        target_date__lte=payroll_row.payroll.date_to,
        approval_by__isnull=False,
    )
    earnings.update(is_locked=close)

    payroll_row.is_closed = close
    payroll_row.save()

    return annotate_payroll_rows(
        PayrollRow.objects.filter(id=payroll_row.id)
    ).first()