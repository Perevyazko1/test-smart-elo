import {Task, TaskExecutor, UpdateTask} from "@entities/Task";

export const getTaskExecutor = (userId: number, task?: Task, formTask?: UpdateTask): TaskExecutor => {
    console.log('Index: ', task?.proposed_tariff?.amount)
    return {
        amount: formTask?.confirmed_tariff?.amount
            || task?.confirmed_tariff?.amount
            || formTask?.proposed_tariff?.amount
            || task?.proposed_tariff?.amount
            || 0,
        employee: userId,
    }
};