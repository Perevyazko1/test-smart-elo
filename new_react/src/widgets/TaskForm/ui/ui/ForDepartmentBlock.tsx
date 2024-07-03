import {Autocomplete, TextField} from "@mui/material";
import {Department} from "@entities/Department";
import React, {useEffect, useMemo, useState} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useDepartmentList} from "@widgets/TaskForm/model/api";
import {TaskViewMode} from "@pages/TaskPage";

interface ForDepartmentBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    active: boolean;
}

export const ForDepartmentBlock = (props: ForDepartmentBlockProps) => {
    const {formTask, setFormTask, active} = props;
    const {data: departmentList, isLoading: departmentsIsLoading} = useDepartmentList({});

    useEffect(() => {
        if (formTask.view_mode !== TaskViewMode.DepartmentVisible && formTask.for_department) {
            const newValue = {...formTask};
            delete newValue.for_department;
            setFormTask(newValue)
        }
        // eslint-disable-next-line
    }, [formTask.view_mode]);

    const currentValue = useMemo(() => {
        return departmentList?.find(item => item.id === formTask.for_department) || null;
    }, [departmentList, formTask.for_department]);

    const editClb = (event: any, newValue: Department | null) => {
        if (newValue) {
            setFormTask({
                ...formTask,
                for_department: newValue.id,
            })
        } else {
            const newValue = {...formTask};
            delete newValue.for_department;
            setFormTask(newValue);
        }
    }

    return (
        <Autocomplete
            size={'small'}
            disablePortal
            readOnly={!active}
            loading={departmentsIsLoading}
            value={currentValue}
            options={departmentList || []}
            getOptionLabel={(option: Department) => option.name}
            onChange={editClb}
            sx={{
                width: 200
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    required={formTask.view_mode === TaskViewMode.DepartmentVisible}
                    label="Отдел"
                    variant="standard"
                />}
        />
    );
};
