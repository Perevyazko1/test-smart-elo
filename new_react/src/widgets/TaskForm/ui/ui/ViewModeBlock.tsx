import {AppSelect} from "@shared/ui";
import {getViewModeText, Task, TaskViewMode, UpdateTask} from "@entities/Task";
import {useEffect, useMemo} from "react";
import {getTaskExecutor} from "@widgets/TaskForm";
import {useCurrentUser} from "@shared/hooks";

interface ViewModeBlockProps {
    task?: Task;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    disabled: boolean;
}


export const ViewModeBlock = (props: ViewModeBlockProps) => {
    const {formTask, setFormDataClb, task, disabled} = props;
    const {currentUser} = useCurrentUser();

    const handleChange = (selectedValue: TaskViewMode) => {
        setFormDataClb("view_mode", selectedValue)
    };

    const currentViewMode = useMemo(() => {
        return formTask.view_mode || task?.view_mode || TaskViewMode.ForParticipants;
    }, [formTask.view_mode, task?.view_mode]);

    useEffect(() => {
        // Если установлен режим только для меня - обнуляем соисполнителей и устанавливаем исполнителем
        // текущего пользователя
        if (currentViewMode === TaskViewMode.OnlyMe) {
            const currentExecutor = formTask.new_executor || task?.new_executor;
            const createdById = task?.created_by || currentUser.id;
            if (currentExecutor?.employee !== createdById) {
                setFormDataClb('new_executor', getTaskExecutor(createdById, task, formTask));
                setFormDataClb('appointed_at', new Date().toISOString());
                setFormDataClb('appointed_by', createdById);
            }
            const currentCoExecutors = formTask.new_co_executors || task?.new_co_executors || [];
            if (currentCoExecutors.length > 0) {
                setFormDataClb('new_co_executors', []);
            }
        }

        if (currentViewMode !== TaskViewMode.DepartmentVisible) {
            const currentDepartments = formTask.for_departments || task?.for_departments || [];
            if (currentDepartments.length > 0) {
                setFormDataClb('for_departments', []);
            }
        }
        //eslint-disable-next-line
    }, [currentViewMode]);

    return (
        <AppSelect
            bordered
            noInput
            label={"Видимость"}
            variant={'dropdown'}
            colorScheme={'lightInput'}
            style={{width: 200}}
            readOnly={disabled}
            value={currentViewMode}
            options={Object.values(TaskViewMode)}
            getOptionLabel={option => getViewModeText(option)}
            onSelect={handleChange}
        />
    )
};
