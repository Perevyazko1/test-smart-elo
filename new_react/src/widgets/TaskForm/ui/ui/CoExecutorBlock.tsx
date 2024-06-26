import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";

interface CoExecutorBlockProps {
    disabled: boolean;
    userList: Employee[];
    isLoading: boolean;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const CoExecutorBlock = (props: CoExecutorBlockProps) => {
    const getCoExecutors = useMemo(() => {
        return props.userList.filter(user => props.formTask.co_executors.includes(user.id))
    }, [props.formTask.co_executors, props.userList])

    return (
        <Autocomplete
            className={'flex-fill'}
            size={'small'}
            readOnly={props.disabled}
            value={getCoExecutors}
            multiple
            disablePortal
            limitTags={2}
            loading={props.isLoading}
            options={props.userList}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            groupBy={(option: Employee) => option.current_department?.name || ""}
            sx={{width: 450}}
            onChange={(event: any, newValue: Employee[] | null) => {
                props.setFormTask({
                    ...props.formTask,
                    co_executors: newValue?.map(user => user.id) || [],
                })
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Соисполнители"
                    variant="standard"
                />}
        />
    );
};
