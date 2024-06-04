import {AppDropdown} from "@shared/ui";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {useMemo, useState} from "react";

export const DepartmentDropdown = () => {
    const {setQueryParam, queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();

    const allDepartment: string = 'Все отделы';

    const getInitialDepartment = (): string => {
        const queryDepartmentName = queryParameters.department__name;
        if (queryDepartmentName) {
            return currentUser.departments?.find(department => department.name === queryDepartmentName)?.name || allDepartment;
        } else {
            return allDepartment;
        }
    };

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
        <AppDropdown
            selected={currentDepartment}
            active={currentDepartment !== allDepartment}
            items={[allDepartment, ...departments]}
            onSelect={setDepartmentClb}
        />
    );
};
