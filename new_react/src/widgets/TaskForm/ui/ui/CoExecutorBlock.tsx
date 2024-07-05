import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useEffect, useMemo, useState} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";

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
        <Autocomplete
            className={'flex-fill'}
            size={'small'}
            readOnly={disabled}
            value={value}
            multiple
            disablePortal
            limitTags={2}
            loading={isLoading}
            options={userList}
            groupBy={(option: Employee) => option.permanent_department?.name || ""}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            sx={{width: 450}}
            onChange={(event: any, newValue: Employee[] | null) => {
                setValue(newValue || [])
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label={isLoading ? "Загрузка..." : "Соисполнители / Наблюдатели"}
                    variant="standard"
                />}
        />
    );
};
