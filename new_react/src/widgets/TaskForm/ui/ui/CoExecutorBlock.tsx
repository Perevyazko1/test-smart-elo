import {getEmployeeName} from "@shared/lib";
import React, {useEffect, useMemo, useState} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {UserListRender} from "@widgets/UserListRender/UserListRender";
import {GroupedEmployeeItem} from "@entities/Employee";

interface CoExecutorBlockProps {
    disabled: boolean;
    userList: GroupedEmployeeItem[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const CoExecutorBlock = (props: CoExecutorBlockProps) => {
    const {userList, formTask, disabled, isLoading, setFormTask} = props;

    const [value, setValue] = useState<GroupedEmployeeItem[]>([]);
    const [inited, setInited] = useState<boolean>(false);


    useEffect(() => {
        if (!inited && userList.length > 0) {
            setValue(
                userList.filter(option => formTask.co_executors?.includes(option.user.id))
            )
            setInited(true)
        }
    }, [formTask.co_executors, inited, userList]);

    const coExecutorIds = useMemo(() => {
        return value.map(user => user.user.id)
    }, [value])

    useEffect(() => {
        if (inited && coExecutorIds !== formTask.co_executors) {
            setFormTask({
                ...formTask,
                co_executors: coExecutorIds,
            })
        }
        // eslint-disable-next-line
    }, [inited, coExecutorIds, formTask.co_executors])

    return (
        <AppAutocomplete
            variant={"multiple"}
            label={isLoading ? "Загрузка..." : "Соисполнители / Наблюдатели"}
            readOnly={disabled}
            className={'flex-fill'}
            value={value}
            loading={isLoading}
            options={userList}
            groupBy={(option: GroupedEmployeeItem) => option.group}
            onChangeClb={(newValue: GroupedEmployeeItem[] | null) => {
                setValue(newValue || [])
            }}
            renderOption={(props, option) => option ?
                <UserListRender
                    props={props}
                    option={option.user}
                    key={option.user.id}
                /> : undefined}
            limitTags={2}
            getOptionLabel={(option: GroupedEmployeeItem) => getEmployeeName(option.user, 'listNameInitials')}
        />
    );
};
