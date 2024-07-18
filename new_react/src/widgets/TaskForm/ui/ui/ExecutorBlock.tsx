import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useCurrentUser} from "@shared/hooks";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {UserListRender} from "@widgets/UserListRender/UserListRender";
import {GroupedEmployeeItem} from "@entities/Employee";

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
        <AppAutocomplete
            variant={'select'}
            value={getInitialValue}
            groupBy={(option: GroupedEmployeeItem | null) => option?.group || ""}
            getOptionLabel={(option: GroupedEmployeeItem | null) => getEmployeeName(option?.user, 'listNameInitials')}
            loading={isLoading}
            width={250}
            renderOption={(props, option) => option ?
                <UserListRender
                    props={props}
                    option={option.user}
                    key={option.user.id}
                /> : undefined}
            onChangeClb={changeClb}
            colorscheme={'light'}
            label={isLoading ? "Загрузка..." : "Исполнитель"}
            options={userList}
            readOnly={disabled}
        />
    );
};
