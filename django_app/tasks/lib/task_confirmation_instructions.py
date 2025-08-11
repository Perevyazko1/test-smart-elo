from datetime import datetime

from salary.service.make_earning import make_earning
from ..models import Task


def task_confirmation_instructions(task: Task):
    task.refresh_from_db()
    earning = None
    if task.confirmed_tariff and not task.verified_at:
        description = f'Соисполнитель в задаче № {task.id} {task.title[:50]}'
        for co_executor in task.new_co_executors.all():
            if co_executor.amount:
                earning = make_earning(
                    earning_type="ДОП",
                    amount=co_executor.amount,
                    user=co_executor.employee,
                    created_by=task.created_by,
                    approval_by=task.confirmed_tariff.created_by,
                    target_date=task.ready_at,
                    comment=description,
                    earning_comment=description,
                )

        if task.new_executor:
            description = f'Исполнитель в задаче № {task.id} {task.title[:50]}'
            if task.new_executor.amount:
                earning = make_earning(
                    earning_type="ДОП",
                    amount=task.new_executor.amount,
                    user=task.new_executor.employee,
                    created_by=task.created_by,
                    approval_by=task.confirmed_tariff.created_by,
                    target_date=task.ready_at,
                    comment=description,
                    earning_comment=description,
                )

        if earning is not None:
            task.verified_at = earning.target_date
            task.save()
    else:
        task.verified_at = datetime.now()
        task.save()
