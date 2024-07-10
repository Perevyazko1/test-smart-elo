import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useEffect, useMemo, useState} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

interface CoExecutorBlockProps {
    disabled: boolean;
    userList: Employee[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const CoExecutorBlock = (props: CoExecutorBlockProps) => {
    const {userList, formTask, disabled, isLoading, setFormTask} = props;

    const [value, setValue] = useState<Employee[]>([]);
    const [inited, setInited] = useState<boolean>(false);


    useEffect(() => {
        if (!inited && userList.length > 0) {
            setValue(
                userList.filter(user => formTask.co_executors?.includes(user.id))
            )
            setInited(true)
        }
    }, [formTask.co_executors, inited, userList]);

    const coExecutorIds = useMemo(() => {
        return value.map(user => user.id)
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
            groupBy={(option: Employee) => option.permanent_department?.name || ""}
            onChangeClb={(newValue: Employee[] | null) => {
                setValue(newValue || [])
            }}
            limitTags={2}
            getOptionLabel={(option: Employee) => getEmployeeName(option, 'listNameInitials')}
        />
    );
};
