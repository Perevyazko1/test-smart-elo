import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useCurrentUser} from "@shared/hooks";
import {GroupedEmployeeItem} from "@entities/Employee";
import {AppSelect} from "@shared/ui";
import {UserOptionRender} from "@widgets/UserOptionRender/UserListRender";

interface ExecutorBlockProps {
    disabled: boolean;
    userList: GroupedEmployeeItem[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const ExecutorBlock = (props: ExecutorBlockProps) => {
    const {disabled, formTask, userList, isLoading, setFormTask} = props;
    const {currentUser} = useCurrentUser();
    const getInitialValue = useMemo(() => {
        return userList.find(user => user.user.id === formTask.executor) || null;
    }, [formTask.executor, userList])

    const changeClb = (newValue: GroupedEmployeeItem | null) => {
        if (newValue) {
            setFormTask({
                ...formTask,
                executor: newValue?.user.id || null,
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
        <AppSelect
            bordered
            label={"Исполнитель"}
            variant={'select'}
            style={{width: 250}}
            colorScheme={'lightInput'}
            value={getInitialValue}
            readOnly={disabled}
            options={userList}
            getOptionLabel={option => getEmployeeName(option?.user, 'listNameInitials')}
            getRenderOption={(props) => <UserOptionRender {...props}/>}
            isLoading={isLoading}
            onSelect={changeClb}
        />
    )
};
