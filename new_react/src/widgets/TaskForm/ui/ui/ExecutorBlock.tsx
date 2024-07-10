import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useCurrentUser} from "@shared/hooks";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

interface ExecutorBlockProps {
    disabled: boolean;
    userList: Employee[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const ExecutorBlock = (props: ExecutorBlockProps) => {
    const {disabled, formTask, userList, isLoading, setFormTask} = props;
    const {currentUser} = useCurrentUser();
    const getInitialValue = useMemo(() => {
        return props.userList.find(user => user.id === formTask.executor) || null;
    }, [formTask.executor, props.userList])

    const changeClb = (newValue: Employee | null) => {
        if (newValue) {
            setFormTask({
                ...formTask,
                executor: newValue?.id || null,
                appointed_at: new Date().toISOString(),
                appointed_by: currentUser.id,
            })
        } else {
            setFormTask({
                ...formTask,
                executor: null,
                appointed_at: "",
                appointed_by: null,
            })
        }
    }

    return (
        <AppAutocomplete
            variant={'select'}
            value={getInitialValue}
            groupBy={(option: Employee | null) => option?.permanent_department?.name || ""}
            getOptionLabel={(option: Employee | null) => getEmployeeName(option, 'listNameInitials')}
            loading={isLoading}
            width={250}
            onChangeClb={changeClb}
            colorScheme={'light'}
            label={isLoading ? "Загрузка..." : "Исполнитель"}
            options={userList}
            readOnly={disabled}
        />
    );
};
