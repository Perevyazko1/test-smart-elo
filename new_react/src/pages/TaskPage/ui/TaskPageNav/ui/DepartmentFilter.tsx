import {useDepartmentList} from "@widgets/TaskForm/model/api";
import React, {useEffect, useMemo, useState} from "react";
import {Department} from "@entities/Department";
import {useQueryParams} from "@shared/hooks";
import {AppSelect} from "@shared/ui";

export const DepartmentFilter = () => {
    const {data, isLoading} = useDepartmentList({});
    const {queryParameters, setQueryParam} = useQueryParams();

    const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);

    const selectClb = (departments: Department[] | null) => {
        const queryValue = departments?.map(department => department.id).join();
        setQueryParam('departments', queryValue || '');
    };

    useEffect(() => {
        if (data) {
            if (queryParameters.departments) {
                const queryIds = queryParameters.departments.split(',').map(item => Number(item));
                setSelectedDepartments(data.filter(item => queryIds.includes(item.id)));
            } else {
                setSelectedDepartments([]);
            }
        }
    }, [queryParameters.departments, data]);

    return (
        <AppSelect
            style={{width: 160}}
            isLoading={isLoading}
            variant={'multiple'}
            colorScheme={'darkInput'}
            label={'Отделы'}
            value={selectedDepartments}
            onSelect={selectClb}
            getOptionLabel={option => option.name}
            options={data}
        />
    );
};
