import {useDepartmentList} from "@widgets/TaskForm/model/api";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import React, {useEffect, useMemo, useState} from "react";
import {Department} from "@entities/Department";
import {useQueryParams} from "@shared/hooks";

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

    const getLabel = useMemo(() => {
        if (isLoading) {
            return 'Загрузка...';
        } else if (selectedDepartments.length === 0) {
            return  'Отделы (все)';
        } else {
            return 'Отделы';
        }
    }, [isLoading, selectedDepartments.length]);

    return (
        <AppAutocomplete
            colorscheme={'dark'}
            style={{zIndex: "1000", marginTop: "3px"}}
            label={getLabel}
            variant={'multiple'}
            value={selectedDepartments}
            onChangeClb={selectClb}
            getOptionLabel={option => option.name}
            options={data}
            loading={isLoading}
            width={200}
        />
    );
};
