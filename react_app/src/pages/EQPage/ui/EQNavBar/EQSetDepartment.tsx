import React, {memo, useCallback} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {getCurrentDepartment, getEmployeeAuthData, getEmployeeDepartments} from "entities/Employee";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {fetchCurrentDepartment} from "../../model/service/fetchCurrentDepartment/fetchCurrentDepartment";

interface ChangeDepartmentProps {
    className?: string;
}


export const EQSetDepartment = memo((props: ChangeDepartmentProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const auth_data = useSelector(getEmployeeAuthData)
    const currentDepartment = useSelector(getCurrentDepartment)
    const departments = useSelector(getEmployeeDepartments)

    const change_current_department = useCallback((department_number: number) => {
        if (auth_data?.pin_code) {
            dispatch(fetchCurrentDepartment({
                pin_code: auth_data?.pin_code,
                department_number: department_number
            }))
        }
    },[auth_data?.pin_code, dispatch])

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={currentDepartment?.name}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите отдел</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {departments?.map((department) => (
                <Dropdown.Item
                    key={department.number}
                    active={department.name===currentDepartment?.name}
                    onClick={() => change_current_department(department.number)}
                >
                    {department.name}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
});