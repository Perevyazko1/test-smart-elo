import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useCallback} from "react";
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

    const getOptionLabel = useCallback((option: number) => {
        return getEmployeeName(userList.find(user => user.id === option))
    }, [userList])

    return (
        <Autocomplete
            className={'flex-fill'}
            size={'small'}
            readOnly={disabled}
            value={formTask.co_executors}
            multiple
            disablePortal
            limitTags={2}
            loading={isLoading}
            options={userList.map(user => user.id)}
            getOptionLabel={getOptionLabel}
            sx={{width: 450}}
            onChange={(event: any, newValue: number[] | null) => {
                setFormTask({
                    ...props.formTask,
                    co_executors: newValue || [],
                })
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
