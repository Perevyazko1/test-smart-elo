import {getEmployeeName} from "@shared/lib";
import React, {useEffect, useMemo, useState} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {GroupedEmployeeItem} from "@entities/Employee";
import {AppSelect} from "@shared/ui";
import {UserOptionRender} from "@widgets/UserOptionRender/UserListRender";

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
    }, [inited, coExecutorIds, formTask.co_executors]);

    return (
        <AppSelect
            bordered
            variant={'multiple'}
            colorScheme={'lightInput'}
            label={"Соисполнители / Наблюдатели"}
            style={{minWidth: 400}}
            className={'flex-fill'}
            readOnly={disabled}
            isLoading={isLoading}
            value={value}
            onSelect={(newValue: GroupedEmployeeItem[] | null) => {
                setValue(newValue || [])
            }}
            options={userList}
            getOptionLabel={(option: GroupedEmployeeItem) => getEmployeeName(option.user, 'initials')}
            getRenderOption={(props) => <UserOptionRender {...props}/>}
        />
    );
};
