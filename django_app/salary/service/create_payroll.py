from datetime import timedelta, date

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Sum

from salary.models import Payroll, PayrollRow, Earning
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
            balance = None

            if previous_payroll:
                try:
                    previous_payroll_row = PayrollRow.objects.get(
                        payroll=previous_payroll,
                        user=user,
                    )

                    if previous_payroll_row.is_closed:
                        earned = Earning.objects.filter(
                            user=user,
                            target_date__gte=previous_payroll.date_from,
                            target_date__lte=previous_payroll.date_to,
                            approval_by__isnull=False,
                        ).aggregate(Sum('amount'))['amount__sum'] or 0
                        balance = previous_payroll_row.start_balance or 0 + earned
                except PayrollRow.DoesNotExist:
                    balance = 0
            else:
                balance = 0

            PayrollRow.objects.create(
                payroll=payroll,
                user=user,
                is_locked=False,
                comment="",
                start_balance=balance,
                cash_payout=0,
                cash_approval=False,
            )
