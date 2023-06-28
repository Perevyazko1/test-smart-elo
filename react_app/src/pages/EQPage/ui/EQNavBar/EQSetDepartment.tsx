import React, {memo, useCallback} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {getCurrentDepartment, getEmployeeAuthData, getEmployeeDepartments} from "entities/Employee";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {fetchCurrentDepartment} from "../../model/service/fetchCurrentDepartment/fetchCurrentDepartment";
import {eqActions} from "../../model/slice/eqSlice";
import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {eqAwaitListActions} from "../../model/slice/awaitListSlice";
import {eqInWorkListActions} from "../../model/slice/inWorkListSlice";
import {eqReadyListActions} from "../../model/slice/readyListSlice";

interface ChangeDepartmentProps {
    className?: string;
}


export const EQSetDepartment = memo((props: ChangeDepartmentProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const auth_data = useSelector(getEmployeeAuthData)
    const currentDepartment = useSelector(getCurrentDepartment)
    const departments = useSelector(getEmployeeDepartments)
    const current_view_mode = useSelector(getCurrentViewMod)

    const change_current_department = useCallback((department_number: number) => {
        if (auth_data?.pin_code && department_number !== currentDepartment?.number) {
            dispatch(fetchCurrentDepartment({
                pin_code: auth_data?.pin_code,
                department_number: department_number
            })).then(() => {
                dispatch(eqAwaitListActions.hasUpdated())
                dispatch(eqInWorkListActions.hasUpdated())
                dispatch(eqReadyListActions.hasUpdated())
                dispatch(eqActions.weekInfoUpdated())
            })
            if (current_view_mode?.key !== 1) {
                dispatch(eqActions.setDefaultFilters())
            }
        }
    }, [currentDepartment?.number, current_view_mode, auth_data?.pin_code, dispatch])

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={currentDepartment?.name || 'Выберите отдел'}
            className={classNames('', mods, [className])}
            {...otherProps}
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
        </DropdownButton>
    );
});