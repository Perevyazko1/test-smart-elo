import React, {useCallback, useMemo} from "react";
import {AppSelect} from "@shared/ui";
import {Task, TaskViewMode, UpdateTask} from "@entities/Task";
import {useDepartmentList} from "@entities/Department";

interface ForDepartmentsBlockProps {
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    task?: Task;
    active: boolean;
}

export const ForDepartmentsBlock = (props: ForDepartmentsBlockProps) => {
    const {formTask, task, setFormDataClb, active} = props;
    const {data: departmentList, isLoading: departmentsIsLoading} = useDepartmentList({});

    const departmentIds = useMemo(() => {
        return departmentList?.map(department => department.id)
    }, [departmentList]);


    const getOptionLabel = useCallback((option: number) => {
        return departmentList?.find(department => department.id === option)?.name || '';
    }, [departmentList]);

    const isRequired = useMemo(() => {
        if (formTask.view_mode === TaskViewMode.DepartmentVisible) {
            return !!(formTask.for_departments && formTask.for_departments?.length < 1);
        } else {
            return false;
        }
    }, [formTask.for_departments, formTask.view_mode]);

    return (
        <AppSelect
            bordered
            label={"Отделы"}
            className={'flex-fill'}
            variant={'multiple'}
            colorScheme={'lightInput'}
            value={formTask.for_departments || task?.for_departments || []}
            options={departmentIds || []}
            getOptionLabel={getOptionLabel}
            required={isRequired}
            isLoading={departmentsIsLoading}
            readOnly={!active}
            onSelect={(newValue: number[]) => {
                setFormDataClb('for_departments', newValue)
            }}
        />
    );
};
