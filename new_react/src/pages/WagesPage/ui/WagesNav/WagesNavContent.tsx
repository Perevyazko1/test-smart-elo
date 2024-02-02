import {useAppQuery, useCurrentUser} from "@shared/hooks";
import React, {useCallback, useMemo, useState} from "react";
import {AppDropdown} from "@shared/ui";

export const WagesNavContent = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const {currentUser} = useCurrentUser();
    const allDepartment = 'Все отделы';

    // Инициализируем отдел если таков был в query параметрах
    const getInitialDepartment = useCallback((): string => {
        const queryDepartmentName = queryParameters.department__name;
        if (queryDepartmentName) {
            return currentUser.departments?.find(department => department.name === queryDepartmentName)?.name || allDepartment;
        } else {
            return allDepartment;
        }
    }, [allDepartment, currentUser.departments, queryParameters.department__name]);

    const [currentDepartment, setCurrentDepartment] = useState<string>(getInitialDepartment());

    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );

    const setDepartmentClb = (department: string) => {
        setCurrentDepartment(department);
        if (department !== allDepartment) {
            setQueryParam('department__name', department)
        } else {
            setQueryParam('department__name', '')
        }
    };


    return (
        <>
            <AppDropdown
                selected={currentDepartment}
                active={currentDepartment !== allDepartment}
                items={[allDepartment, ...departments]}
                onSelect={setDepartmentClb}
            />
        </>
    );
};
