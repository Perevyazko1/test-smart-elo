import React, {useId, useMemo} from "react";

import {Input} from "@mui/material";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DoneAllIcon from "@mui/icons-material/DoneAll";

import {NewTaskTariff, Task, TaskExecutor, UpdateTask} from "@entities/Task";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";


interface AmountBlockProps {
    task?: Task;
    formTask: UpdateTask;
    disabled: boolean;
    showAmountDetail: boolean;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    setShowAmountDetail: (value: boolean) => void;
}

export const AmountBlock = (props: AmountBlockProps) => {
    const {task, formTask, setFormDataClb, showAmountDetail, setShowAmountDetail} = props;
    const id = useId();
    const {currentUser} = useCurrentUser();

    const createTariffPermission = usePermission(APP_PERM.TARIFFICATION_BILLING);
    const confirmTariffPermission = usePermission(APP_PERM.TARIFFICATION_CONFIRM);

    const createTariffData = (amount: number): NewTaskTariff => {
        return {
            created_by: currentUser.id,
            amount: amount,
            comment: "",
        }
    }

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let newValue = event.target.value;
        newValue = newValue.replace(/^0+/, '');

        if (confirmTariffPermission || createTariffPermission) {
            if (formTask.new_co_executors || task?.new_co_executors) {
                const executor = formTask.new_executor || task?.new_executor;
                if (executor) {
                    setFormDataClb('new_executor', {employee: executor.employee, amount: Number(newValue)});
                }
                const co_executors = formTask.new_co_executors || task?.new_co_executors;
                if (co_executors) {
                    setFormDataClb('new_co_executors', co_executors.map(item => ({
                        employee: item.employee,
                        amount: 0
                    })));
                }
            }
            setFormDataClb('proposed_tariff', createTariffData(Number(newValue)));
        }

        if (confirmTariffPermission) {
            setFormDataClb('confirmed_tariff', createTariffData(Number(newValue)));
        }
    };

    const getInputValue = useMemo(() => {
        let value = 0
        if (formTask.confirmed_tariff) {
            value = formTask.confirmed_tariff.amount;
        } else if (formTask.proposed_tariff) {
            value = formTask.proposed_tariff.amount;
        } else if (task?.confirmed_tariff) {
            value = task.confirmed_tariff.amount;
        } else if (task?.proposed_tariff) {
            value = task.proposed_tariff.amount;
        }
        if (value === 0) {
            return "0"
        }
        return String(value).replace(/^0+/, '');
    }, [
        formTask.confirmed_tariff,
        formTask.proposed_tariff,
        task?.confirmed_tariff,
        task?.proposed_tariff
    ]);

    const taskExecutor = useMemo(() => {
        return formTask.new_executor || task?.new_executor || null;
    }, [formTask.new_executor, task?.new_executor]);

    const taskCoExecutors = useMemo(() => {
        return formTask.new_co_executors || task?.new_co_executors || [];
    }, [formTask.new_co_executors, task?.new_co_executors]);

    const currentAmount = useMemo(() => {
        let result: TaskExecutor[] = [];
        if (taskExecutor) {
            result = [taskExecutor];
        }
        if (taskCoExecutors) {
            result = [...result, ...taskCoExecutors];
        }
        const targetExecutor = result.find(item => item.employee === currentUser.id)
        return targetExecutor?.amount || 0;
    }, [currentUser.id, taskCoExecutors, taskExecutor]);

    const buttonVariant = useMemo(() => {
        if (task?.confirmed_tariff?.amount || formTask.confirmed_tariff?.amount) {
            return {
                variant: 'greenBtn',
                disabled: true,
            };
        }
        if (task?.proposed_tariff || formTask.proposed_tariff) {
            return {
                variant: 'yellowBtn',
                disabled: !confirmTariffPermission,
            };
        }
        return {
            variant: '',
            disabled: true,
        }
    }, [
        confirmTariffPermission,
        formTask.confirmed_tariff?.amount,
        formTask.proposed_tariff,
        task?.confirmed_tariff?.amount,
        task?.proposed_tariff
    ]);

    const handleVisa = () => {
        const proposedTariff = formTask.proposed_tariff || task?.proposed_tariff;
        if (confirmTariffPermission && proposedTariff) {
            setFormDataClb('confirmed_tariff', createTariffData(Number(proposedTariff.amount)));
        }
    };

    return (
        <div className={'d-flex align-self-stretch align-items-end gap-2'}>
            <span
                className={'fs-7 fw-bold'}
            >
                Сделка:
            </span>
            <Input
                id={id}
                value={getInputValue}
                readOnly={!createTariffPermission && !confirmTariffPermission}
                onChange={handleInput}
                size="small"
                inputProps={{
                    min: 0,
                    type: 'number',
                    sx: {
                        padding: 0,
                        width: 80,
                    }
                }}
            />
            <span className={'fs-6'}>
                ({currentAmount})
            </span>

            <button
                disabled={buttonVariant.disabled}
                type={'button'}
                onClick={handleVisa}
                className={'appBtn p-1 ' + buttonVariant.variant}
            >
                <DoneAllIcon fontSize={'small'}/>
            </button>


            <button
                type={'button'}
                className={`appBtn p-1 ${showAmountDetail ? "blackBtn" : ""}`}
                onClick={() => setShowAmountDetail(!showAmountDetail)}
            >
                <AccountTreeIcon fontSize={'small'}/>
            </button>
        </div>
    );
};
