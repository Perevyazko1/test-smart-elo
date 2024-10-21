from django.db.models import Sum, Case, When, F, Value, IntegerField

from ..models import Employee, Transaction


def get_earned_sum(user: Employee,
                   start_date: str,
                   end_date: str,
                   by_target_date: bool = True,
                   wages_only: bool = False):
    filter_params = {
        "employee": user,
        f"{'target_date' if by_target_date else 'add_date'}__gte": start_date,
        f"{'target_date' if by_target_date else 'add_date'}__lte": end_date,
    }

    if wages_only:
        filter_params['details__in'] = ['wages', 'prize', 'fine']

    transactions = Transaction.objects.filter(**filter_params).annotate(
        is_accrual=Case(
            When(transaction_type='accrual', then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        is_debiting=Case(
            When(transaction_type='debiting', then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        is_cash_card_tax=Case(
            When(transaction_type__in=['cash', 'card', 'tax'], then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        is_inspector_null=Case(
            When(inspector__isnull=True, then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        )
    )

    totals = transactions.aggregate(
        total_wages_accrual=Sum(Case(When(is_accrual=1, then=F('amount')), output_field=IntegerField())),
        total_wages_debiting=Sum(Case(When(is_debiting=1, then=F('amount')), output_field=IntegerField())),

        total_pre_wages_accrual=Sum(
            Case(When(is_accrual=1, is_inspector_null=1, then=F('amount')), output_field=IntegerField())),
        total_pre_wages_debiting=Sum(
            Case(When(is_debiting=1, is_inspector_null=1, then=F('amount')), output_field=IntegerField())),

        total_debit=Sum(Case(When(is_cash_card_tax=1, then=F('amount')), output_field=IntegerField())),
        total_pre_debit=Sum(
            Case(When(is_cash_card_tax=1, is_inspector_null=1, then=F('amount')), output_field=IntegerField())),

        no_confirmed=Sum(Case(When(is_inspector_null=1, then=Value(1)), output_field=IntegerField())),
    )

    return {
        "total_wages": (totals['total_wages_accrual'] or 0) - (totals['total_wages_debiting'] or 0),
        "total_pre_wages": (totals['total_pre_wages_accrual'] or 0) - (totals['total_pre_wages_debiting'] or 0),
        "total_debit": totals['total_debit'] or 0,
        "total_pre_debit": totals['total_pre_debit'] or 0,
        "no_confirmed": (totals['no_confirmed'] or 0) > 0,
    }
