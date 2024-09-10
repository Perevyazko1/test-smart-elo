import {getStatusText, Task} from "@entities/Task";

interface TaskTitleProps {
    task?: Task;
}

export const TaskTitle = (props: TaskTitleProps) => {
    const {task} = props;

    if (task) {
        return (
            <h4>Задача № {task.id} (статус: {getStatusText(task.status)}) </h4>
        )
    }

    return (
        <h4>Новая задача</h4>
    );
};
