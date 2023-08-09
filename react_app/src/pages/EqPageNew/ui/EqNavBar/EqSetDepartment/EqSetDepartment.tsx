import React, {memo, useCallback} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getCurrentDepartment, getEmployeeAuthData, getEmployeeDepartments} from "entities/Employee";

import {getViewModeFilter} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../model/slice/eqFiltersSlice";
import {fetchCurrentDepartment} from "../../../model/service/fetchCurrentDepartment";


export const EqSetDepartment = memo((props: Omit<NavDropdownProps, 'title' | 'children'>) => {
    const dispatch = useAppDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const currentDepartment = useSelector(getCurrentDepartment)
    const departments = useSelector(getEmployeeDepartments)
    const currentViewMode = useSelector(getViewModeFilter)?.currentFilter

    const change_current_department = useCallback((department_number: number) => {
        if (authData?.pin_code && department_number !== currentDepartment?.number) {
            dispatch(fetchCurrentDepartment({
                department_number: department_number
            })).then(() => {
                dispatch(eqFiltersActions.listsHasUpdated())
                dispatch(eqFiltersActions.weekDataHasUpdated())
            })
            if (![0, 1, 2].includes(currentViewMode?.key || 0)) {
                dispatch(eqFiltersActions.setDefaultViewMode())
            }
        }
    }, [currentDepartment?.number, currentViewMode, authData?.pin_code, dispatch])

    return (
        <NavDropdown
            title={currentDepartment?.name || ''}
            variant={"outline-light"}
            // style={{backgroundColor: currentDepartment?.color}}
            {...props}
        >
            <Dropdown.ItemText>
                Выбор отдела
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {departments?.map((department) => (
                <Dropdown.Item
                    key={department.number}
                    active={department.name === currentDepartment?.name}
                    onClick={() => change_current_department(department.number)}
                >
                    {department.name}
                </Dropdown.Item>
            ))}

        </NavDropdown>
    );
});