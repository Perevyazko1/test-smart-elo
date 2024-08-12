import {useAppQuery, useCurrentUser} from "@shared/hooks";
import React, {useCallback, useEffect, useMemo} from "react";
import {AppDropdown} from "@shared/ui";

export const WagesNavContent = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const {currentUser} = useCurrentUser();
    const allDepartment = 'Все отделы';

    // Инициализируем отдел если таков был в query параметрах
    const getDepartmentValue = useCallback((): string => {
        const queryDepartmentName = queryParameters.department__name;
        if (queryDepartmentName) {
            return currentUser.departments?.find(department => department.name === queryDepartmentName)?.name || allDepartment;
        } else {
            return allDepartment;
        }
    }, [allDepartment, currentUser.departments, queryParameters.department__name]);

    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );

    const setDepartmentClb = (department: string) => {
        if (department !== allDepartment) {
            setQueryParam('department__name', department)
        } else {
            setQueryParam('department__name', '')
        }
    };

    useEffect(() => {

    }, []);


    return (
        <>
            <AppDropdown
                selected={getDepartmentValue()}
                active={getDepartmentValue() !== allDepartment}
                items={[allDepartment, ...departments]}
                onSelect={setDepartmentClb}
            />
        </>
    );
};
