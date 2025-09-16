from datetime import timedelta, date

from django.core.exceptions import ValidationError
from django.db import transaction

from salary.models import Payroll, PayrollRow
from staff.models import Employee


def create_payroll(date_from: date, days=6):
    with transaction.atomic():
        if date_from.weekday() != 0:
            raise ValidationError("Дата начала должна быть понедельником")

        previous_day = date_from - timedelta(days=1)

        previous_payroll = Payroll.objects.filter(date_to=previous_day).first()

        any_payroll_exists = Payroll.objects.exists()

        if not previous_payroll and any_payroll_exists:
            raise ValidationError("Отсутствует предыдущая ведомость")

        date_to = date_from + timedelta(days=days)

        existing_payroll = Payroll.objects.filter(
            date_from__lte=date_to,
            date_to__gte=date_from
        ).exists()

        if existing_payroll:
            raise ValidationError("Уже существует ведомость за указанный период")

        payroll = Payroll.objects.create(
            name=f"Нед. {date_from.isocalendar()[1]}",
            date_from=date_from,
            date_to=date_to,
            is_closed=False,
            cash_payout=0,
            state="1",
        )

        users = Employee.objects.filter(
            is_active=True,
        )
        for user in users:
            PayrollRow.objects.create(
                payroll=payroll,
                user=user,
                is_locked=False,
                comment="",
                cash_payout=0,
                cash_approval=False,
            )
