# Например, в utils.py или в models.py
from django.db.models import Exists, OuterRef, Subquery, Sum, DecimalField
from .models import Earning, PayrollRow


def create_sum_subquery(queryset, earning_type=None):
    if earning_type:
        queryset = queryset.filter(earning_type=earning_type)
    return Subquery(
        queryset.values('user_id')
        .annotate(total=Sum('amount'))
        .values('total'),
        output_field=DecimalField()
    )


def annotate_payroll_rows(queryset):
    unconfirmed_earnings = Earning.objects.filter(
        user_id=OuterRef('user_id'),
        target_date__date__gte=OuterRef('payroll__date_from'),
        target_date__date__lte=OuterRef('payroll__date_to'),
        approval_by__isnull=True
    )

    hide_balance_rows = PayrollRow.objects.filter(
        user_id=OuterRef('user_id'),
        is_closed=False,
        payroll__date_to__lt=OuterRef('payroll__date_from')
    )

    earnings_in_period = Earning.objects.filter(
        user_id=OuterRef('user_id'),
        target_date__date__gte=OuterRef('payroll__date_from'),
        target_date__date__lte=OuterRef('payroll__date_to'),
    )

    balance_earnings = Earning.objects.filter(
        user_id=OuterRef('user_id'),
        target_date__date__lt=OuterRef('payroll__date_from'),
        approval_by__isnull=False
    ).exclude(earning_type='ЗАЙМ')

    all_time_earnings = Earning.objects.filter(user_id=OuterRef('user_id'))

    return queryset.select_related(
        'payroll',
        'user',
        'user__permanent_department'
    ).annotate(
        annotated_has_unconfirmed=Exists(unconfirmed_earnings),
        annotated_hide_balance=Exists(hide_balance_rows),
        annotated_tax_sum=create_sum_subquery(earnings_in_period, 'Налог'),
        annotated_card_sum=create_sum_subquery(earnings_in_period, 'На карту'),
        annotated_earned_sum=create_sum_subquery(earnings_in_period, 'ЭЛО'),
        annotated_bonus_sum=create_sum_subquery(earnings_in_period, 'ДОП'),
        annotated_issued_sum=create_sum_subquery(earnings_in_period, 'Выдача НАЛ'),
        annotated_ip_sum=create_sum_subquery(earnings_in_period, 'ИП'),
        annotated_loan_sum=create_sum_subquery(earnings_in_period, 'ПОГ.ЗАЙМА'),
        annotated_balance_sum=create_sum_subquery(balance_earnings),
        annotated_full_loan_sum=create_sum_subquery(all_time_earnings, 'ЗАЙМ'),
        annotated_end_loan_sum=create_sum_subquery(all_time_earnings, 'ПОГ.ЗАЙМА'),
    ).order_by('user__permanent_department__ordering')
