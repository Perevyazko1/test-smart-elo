import React, {memo} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {getCurrentDepartment, getEmployeeDepartments} from "entities/Employee/";
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface ChangeCurrentDepartmentProps {
    className?: string;
}


export const ChangeCurrentDepartment = memo((props: ChangeCurrentDepartmentProps) => {
    const {
        className,
        ...otherProps
    } = props

    const currentDepartment = useSelector(getCurrentDepartment)
    const departments = useSelector(getEmployeeDepartments)

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
                >
                    {department.name}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
});