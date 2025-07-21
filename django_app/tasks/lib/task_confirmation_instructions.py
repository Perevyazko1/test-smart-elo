from datetime import datetime

from salary.service.make_earning import make_earning
from staff.models import Transaction
from ..models import Task


def task_confirmation_instructions(task: Task, verified_at: str):
    task.refresh_from_db()
    if task.confirmed_tariff and not task.verified_at:
        description = f'Соисполнитель в задаче № {task.id} {task.title[:50]}'
        for co_executor in task.new_co_executors.all():
            if co_executor.amount:
                Transaction.objects.create(
                    target_date=datetime.now(),
                    transaction_type='accrual',
                    details='prize',
                    amount=co_executor.amount,
                    employee=co_executor.employee,
                    executor=task.created_by,
                    inspector=task.confirmed_tariff.created_by,
                    description=description,
                )
                make_earning(
                    earning_type="ДОП",
                    amount=co_executor.amount,
                    user=co_executor.employee,
                    created_by=task.created_by,
                    approval_by=task.confirmed_tariff.created_by,
                    target_date=datetime.now(),
                    comment=description,
                    earning_comment=description,
                )

        if task.new_executor:
            description = f'Исполнитель в задаче № {task.id} {task.title[:50]}'
            if task.new_executor.amount:
                Transaction.objects.create(
                    target_date=datetime.now(),
                    transaction_type='accrual',
                    details='prize',
                    amount=task.new_executor.amount,
                    employee=task.new_executor.employee,
                    executor=task.created_by,
                    inspector=task.confirmed_tariff.created_by,
                    description=description,
                )
                make_earning(
                    earning_type="ДОП",
                    amount=task.new_executor.amount,
                    user=task.new_executor.employee,
                    created_by=task.created_by,
                    approval_by=task.confirmed_tariff.created_by,
                    target_date=datetime.now(),
                    comment=description,
                    earning_comment=description,
                )

    task.verified_at = verified_at
    task.save()
