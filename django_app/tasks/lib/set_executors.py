from ..models import Task, TaskExecutor


def set_executors(
        task: Task,
        co_executors_data: [dict] = (),
        executor_data: dict | None = None,
        clear_executor: bool = False,
        clear_co_executors: bool = False,
):
    # Получаем список всех текущих исполнителей
    current_executors = TaskExecutor.objects.filter(task=task)

    # Изначально определяем исполнителя
    if clear_executor:
        task.new_executor.delete()
    elif executor_data:
        executor_employee = executor_data.get('employee', None)
        if executor_employee:
            if current_executors.filter(employee=executor_employee).exists():
                executor = current_executors.get(employee=executor_employee)
                if executor in task.new_co_executors.all():
                    task.new_co_executors.remove(executor)
                task.new_executor = executor
                task.save()
            else:
                executor = TaskExecutor.objects.create(
                    task=task,
                    employee=executor_employee,
                    amount=executor_data.get('amount', 0)
                )
                task.new_executor = executor
                task.save()

    # Далее определяем соисполнителей
    if clear_co_executors:
        task.new_co_executors.all().delete()

    elif co_executors_data:
        current_co_executors = task.new_co_executors.all()
        co_executor_employees = [item.get('employee') for item in co_executors_data]

        # Удаляем тех соисполнителей, которых нет в co_executors_data
        for co_executor in current_co_executors:
            if co_executor.employee not in co_executor_employees:
                co_executor.delete()

        for co_executor_data in co_executors_data:
            co_executor_employee = co_executor_data.get('employee', None)
            if co_executor_employee:
                if current_executors.filter(employee=co_executor_employee).exists():
                    co_executor = current_executors.get(employee=co_executor_employee)
                    if task.new_executor == co_executor:
                        task.new_executor = None
                        task.save()
                else:
                    co_executor = TaskExecutor.objects.create(
                        task=task,
                        employee=co_executor_employee,
                        amount=co_executor_data.get('amount', 0)
                    )
                task.new_co_executors.add(co_executor)

    # После установления всех исполнителей проверяем наличие утвержденного тарифа и распределяем сумму

    # Получаем обновленный список исполнителей
    current_executors = TaskExecutor.objects.filter(task=task)

    actual_tariff = task.confirmed_tariff or task.proposed_tariff

    if actual_tariff:
        all_executors_new_data = []
        if executor_data:
            all_executors_new_data.append(executor_data)
        if co_executors_data:
            all_executors_new_data.extend(co_executors_data)

        # Проверяем итоговую новую сумму
        total_sum = 0
        for executor in current_executors:
            target_executor = None
            for item in all_executors_new_data:
                if item.get("employee", None) == executor.employee:
                    target_executor = item
            if target_executor:
                total_sum += target_executor.get('amount', 0)
            else:
                total_sum += executor.amount

        # Если все совпадает - устанавливаем новые расценки
        if total_sum == actual_tariff.amount:
            for executor in current_executors:
                target_executor = None
                for item in all_executors_new_data:
                    if item.get("employee", None) == executor.employee:
                        target_executor = item

                if target_executor:
                    executor.amount = target_executor.get('amount', 0)
                    executor.save()

        # Если не совпадает - устанавливаем всю сделку на основного исполнителя - а остальных обнуляем
        else:
            if task.new_executor:
                task.new_executor.amount = actual_tariff.amount
                task.new_executor.save()
                task.new_co_executors.all().update(
                    amount=0
                )
    else:
        current_executors.update(amount=0)
