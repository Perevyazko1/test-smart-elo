import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";

interface ExecutorBlockProps {
    disabled: boolean;
    userList: Employee[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const ExecutorBlock = (props: ExecutorBlockProps) => {
    const getInitialValue = useMemo (() => {
        return props.userList.find(user => user.id === props.formTask.executor) || null;
    }, [props.formTask.executor, props.userList])

    return (
        <Autocomplete
            size={'small'}
            readOnly={props.disabled}
            disablePortal
            value={getInitialValue}
            options={props.userList}
            loading={props.isLoading}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            groupBy={(option: Employee) => option.current_department.name}
            sx={{width: 200}}
            onChange={(event: any, newValue: Employee | null) => {
                props.setFormTask({
                    ...props.formTask,
                    executor: newValue?.id || null,
                })
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Исполнитель"
                    variant="standard"
                />}
        />
    );
};
