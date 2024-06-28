import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import React, {useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useCurrentUser} from "@shared/hooks";

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

    const changeClb = (event: any, newValue: Employee | null) => {
        if (newValue) {
            setFormTask({
                ...formTask,
                executor: newValue?.id || null,
                appointed_at: new Date().toISOString(),
                appointed_by: currentUser.id,
            })
        } else {
            props.setFormTask({
                ...formTask,
                executor: null,
                appointed_at: "",
                appointed_by: null,
            })
        }
    }

    return (
        <Autocomplete
            size={'small'}
            readOnly={disabled}
            disablePortal
            value={getInitialValue}
            options={userList}
            loading={isLoading}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            groupBy={(option: Employee) => option.permanent_department?.name || ""}
            sx={{ width: 200 }}
            onChange={changeClb}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label={isLoading ? "Загрузка..." : "Исполнитель"}
                    variant="standard"
                />}
        />
    );
};
