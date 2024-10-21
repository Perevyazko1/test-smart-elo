import React, {useMemo} from "react";

import {Department} from "@entities/Department";
import {AppSelect, AppTooltip} from "@shared/ui";
import {useAppQuery, useCurrentUser} from "@shared/hooks";


export const StaffSelectDepartment = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const {currentUser} = useCurrentUser();

    // Инициализируем отдел если таков был в query параметрах
    const departmentValue = useMemo((): Department | null => {
        const queryDepartmentId = queryParameters.permanent_department__id;
        if (queryDepartmentId) {
            return currentUser.departments?.find(department => String(department.id) === queryDepartmentId) || null;
        } else {
            return null;
        }
    }, [currentUser.departments, queryParameters.permanent_department__id]);

    const setDepartmentClb = (department: Department | null) => {
        setQueryParam('permanent_department__id', department ? String(department.id) : '')
    };


    return (
        <AppTooltip title={'Фильтр по отделу постоянного базирования сотрудника'}>
            <AppSelect
                noInput
                variant={'select'}
                label={'Отдел'}
                style={{width: 150}}
                value={departmentValue}
                colorScheme={'darkInput'}
                options={currentUser.departments}
                onSelect={setDepartmentClb}
                getOptionLabel={option => option ? option.name : ""}
            />
        </AppTooltip>
    );
};
