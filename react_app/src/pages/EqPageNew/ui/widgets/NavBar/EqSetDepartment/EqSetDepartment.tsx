import React, {memo, useCallback} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getCurrentDepartment, getEmployeeAuthData, getEmployeeDepartments} from "entities/Employee";

import {getViewModeFilter} from "../../../../model/selectors/filtersSelectors/filtersSelectors";
import {
    fetchCurrentDepartment
} from "../../../../../EQPage/model/service/fetchCurrentDepartment/fetchCurrentDepartment";
import {eqContentDesktopActions} from "../../../../model/slice/eqContentDesktopSlice";
import {eqFiltersActions} from "../../../../model/slice/eqFiltersSlice";


export const EqSetDepartment = memo((props: Omit<NavDropdownProps, 'title' | 'children'>) => {
    const dispatch = useAppDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const currentDepartment = useSelector(getCurrentDepartment)
    const departments = useSelector(getEmployeeDepartments)
    const currentViewMode = useSelector(getViewModeFilter)?.currentFilter

    const change_current_department = useCallback((department_number: number) => {
        if (authData?.pin_code && department_number !== currentDepartment?.number) {
            dispatch(fetchCurrentDepartment({
                pin_code: authData?.pin_code,
                department_number: department_number
            })).then(() => {
                dispatch(eqContentDesktopActions.allListUpdated())
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