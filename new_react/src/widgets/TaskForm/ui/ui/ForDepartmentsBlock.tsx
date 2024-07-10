import React, {useCallback, useMemo} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {useDepartmentList} from "@widgets/TaskForm/model/api";
import {TaskViewMode} from "@pages/TaskPage";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

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
        <AppAutocomplete
            className={'flex-fill'}
            variant={'multiple'}
            readOnly={!active}
            value={formTask.for_departments || []}
            label={"Отделы"}
            required={isRequired}
            options={departmentIds || []}
            loading={departmentsIsLoading}
            getOptionLabel={getOptionLabel}
            limitTags={2}
            onChangeClb={(newValue: number[] | null) => {
                setFormTask({
                    ...formTask,
                    for_departments: newValue,
                });
            }}
        />
    );
};
