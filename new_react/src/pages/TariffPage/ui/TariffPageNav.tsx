import {useAppQuery, useCurrentUser, useDebounce} from "@shared/hooks";
import {useProjectsList} from "../model/api/api";
import React, {useEffect, useMemo, useState} from "react";
import {TARIFF_STATUSES} from "../model/consts/consts";
import {AppDropdown, AppInput} from "@shared/ui";

export const TariffPageNav = () => {
    const {setQueryParam, queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const allDepartment: string = 'Все отделы';
    const allProjects: string = 'Все проекты';

    const {data} = useProjectsList({mode: 'active'});

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    const [productNameInput, setProductNameInput] = useState<string>(
        queryParameters.product__name || ''
    );

    const [currentProject, setCurrentProject] = useState<string>(
        queryParameters.project || allProjects
    );

    const [currentStatus, setCurrentStatus] = useState<string>(
        queryParameters.tariff_status && queryParameters.tariff_status in TARIFF_STATUSES ?
            TARIFF_STATUSES[queryParameters.tariff_status as keyof typeof TARIFF_STATUSES]
            :
            TARIFF_STATUSES.all
    );

    useEffect(() => {
        debouncedSetQueryParam('product__name', productNameInput)
        // eslint-disable-next-line
    }, [productNameInput]);


    const getInitialDepartment = (): string => {
        const queryDepartmentName = queryParameters.department__name
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

    const setProjectClb = (project: string) => {
        setCurrentProject(project);
        if (project !== allProjects) {
            setQueryParam('project', project)
        } else {
            setQueryParam('project', '')
        }
    };

    const setStatusClb = (status: string) => {
        setCurrentStatus(status);
        if (status !== TARIFF_STATUSES.all) {
            const newValue = Object.keys(TARIFF_STATUSES).find(key => TARIFF_STATUSES[key] === status);
            setQueryParam('tariff_status', newValue || "")
        } else {
            setQueryParam('tariff_status', '')
        }
    };

    const projects = useMemo(() => {
        if (data) {
            return [...data.data];
        } else {
            return [allProjects];
        }
    }, [data]);

    const statuses = useMemo(() => (
        Object.values(TARIFF_STATUSES)
    ), [])

    return (
        <>
            <AppInput placeholder={'Наименование продукта'}
                      className={'ms-3'}
                      onChange={(event) => setProductNameInput(event.target.value)}
                      value={productNameInput}
            />

            <AppDropdown
                selected={currentDepartment}
                active={currentDepartment !== allDepartment}
                items={[allDepartment, ...departments]}
                onSelect={setDepartmentClb}
            />

            <AppDropdown
                selected={currentProject}
                active={currentProject !== allProjects}
                items={projects}
                onSelect={setProjectClb}
            />

            <AppDropdown
                selected={currentStatus}
                active={currentStatus !== TARIFF_STATUSES.all}
                items={statuses}
                onSelect={setStatusClb}
            />
        </>
    );
};
