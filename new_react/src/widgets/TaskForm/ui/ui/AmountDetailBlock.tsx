import {useEffect, useMemo} from "react";

import {Task, UpdateTask} from "@entities/Task";
import {usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {AmountDetail} from "./AmountDetail";


interface AmountDetailBlockProps {
    task?: Task;
    formTask: UpdateTask;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
}


export const AmountDetailBlock = (props: AmountDetailBlockProps) => {
    const {formTask, setFormDataClb, task} = props;

    const proposedTariffPerm = usePermission(APP_PERM.TARIFFICATION_BILLING);

    const taskTariff = useMemo(() => {
        if (formTask.confirmed_tariff) {
            return formTask.confirmed_tariff;
        }
        if (task?.confirmed_tariff) {
            return task.confirmed_tariff;
        }
        if (formTask.proposed_tariff) {
            return formTask.proposed_tariff;
        }
        if (task?.proposed_tariff) {
            return task.proposed_tariff;
        }
        return null;
    }, [formTask.confirmed_tariff, formTask.proposed_tariff, task?.confirmed_tariff, task?.proposed_tariff]);

    const taskExecutor = useMemo(() => {
        if (formTask.new_executor) {
            return formTask.new_executor;
        }
        if (task?.new_executor) {
            return task.new_executor;
        }
        return null;
    }, [formTask.new_executor, task?.new_executor]);

    const taskCoExecutors = useMemo(() => {
        if (formTask.new_co_executors) {
            return formTask.new_co_executors;
        }
        if (task?.new_co_executors) {
            return task.new_co_executors;
        }
        return [];
    }, [formTask.new_co_executors, task?.new_co_executors]);

    const maxAddAmount = useMemo(() => {
        let newTax = 0;
        if (taskCoExecutors) {
            taskCoExecutors.forEach(coExecutor => newTax += coExecutor.amount);
        }
        return newTax;
    }, [taskCoExecutors]);

    const executorAmount = useMemo(() => {
        if (taskTariff) {
            return taskTariff.amount - maxAddAmount;
        }
        return 0;
    }, [taskTariff, maxAddAmount]);

    const setValueClb = (userId: number, newValue: number) => {
        // Найдем индекс исполнителя, которого нужно обновить
        const coExecutorIndex = taskCoExecutors.findIndex(coExecutor => coExecutor.employee === userId);

        if (taskExecutor && coExecutorIndex !== -1) {
            // Клонируем массив соисполнителей
            const updatedCoExecutors = [...taskCoExecutors];

            // Обновляем нужного соисполнителя
            updatedCoExecutors[coExecutorIndex] = {
                ...updatedCoExecutors[coExecutorIndex],
                amount: newValue
            };

            // Передаем обновленный массив в setFormDataClb
            setFormDataClb('new_co_executors', updatedCoExecutors);
        }
    };

    useEffect(() => {
        if (taskExecutor && task?.new_executor?.amount !== executorAmount) {
            setFormDataClb("new_executor", {...taskExecutor, amount: executorAmount});
        }
        //eslint-disable-next-line
    }, [executorAmount]);

    return (
        <div className={'border border-secondary border-1 p-3'}>
            {taskExecutor &&
                <AmountDetail
                    label={'Исполнитель'}
                    disabled={true}
                    userId={taskExecutor.employee}
                    amount={executorAmount || 0}
                    maxValue={taskTariff?.amount || 0}
                />
            }

            {taskCoExecutors.map(co_executor => (
                <AmountDetail
                    label={'Соисполнитель'}
                    disabled={!proposedTariffPerm || !!task?.verified_at}
                    key={co_executor.employee}
                    userId={co_executor.employee}
                    amount={co_executor.amount || 0}
                    maxValue={co_executor.amount + executorAmount}
                    setValue={(newAmount) => setValueClb(co_executor.employee, newAmount)}
                />
            ))}
        </div>
    );
};
