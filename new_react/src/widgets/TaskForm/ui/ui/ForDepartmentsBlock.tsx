import React, {useCallback, useMemo} from "react";
import {Autocomplete, TextField} from "@mui/material";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useDepartmentList} from "@widgets/TaskForm/model/api";
import {TaskViewMode} from "@pages/TaskPage";

interface ForDepartmentsBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    active: boolean;
}

export const ForDepartmentsBlock = (props: ForDepartmentsBlockProps) => {
    const {formTask, setFormTask, active} = props;
    const {data: departmentList, isLoading: departmentsIsLoading} = useDepartmentList({});

    const departmentIds = useMemo(() => {
        return departmentList?.map(department => department.id)
    }, [departmentList])


    const getOptionLabel = useCallback((option: number) => {
        return departmentList?.find(department => department.id === option)?.name || '';
    }, [departmentList]);

    const isRequired = useMemo(() => {
        if (formTask.view_mode === TaskViewMode.DepartmentVisible) {
             return !!(formTask.for_departments && formTask.for_departments?.length < 1);
        } else {
            return false
        }
    }, [formTask.for_departments, formTask.view_mode])
    return (
        <Autocomplete
            className={'flex-fill'}
            size={'small'}
            disablePortal
            multiple
            readOnly={!active}
            loading={departmentsIsLoading}
            value={formTask.for_departments || []}
            options={departmentIds || []}
            getOptionLabel={getOptionLabel}
            onChange={(event: any, newValue: number[] | null) => {
                setFormTask({
                    ...formTask,
                    for_departments: newValue,
                });
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    required={isRequired}
                    label="Отделы"
                    variant="standard"
                />}
        />
    );
};
