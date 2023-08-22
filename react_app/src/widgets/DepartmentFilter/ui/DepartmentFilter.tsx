import React, {memo} from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";

import {department} from "entities/Department";
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface DepartmentFilterProps {
    currentDepartment: department,
    departments?: department[],
    additionalDepartments?: department[],
    setDepartmentCallback: (department: department) => void,
    className?: string
}


export const DepartmentFilter = memo((props: DepartmentFilterProps) => {
    const {
        className,
        currentDepartment,
        departments = [],
        additionalDepartments = [],
        setDepartmentCallback,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            title={currentDepartment?.name || ''}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите отдел</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {[...additionalDepartments, ...departments]?.map((department) => (
                <div key={department.number}>
                    <Dropdown.Item
                        active={currentDepartment.name === department.name}
                        onClick={() => setDepartmentCallback(department)}
                    >
                        {department.name}
                    </Dropdown.Item>
                </div>
            ))}

        </DropdownButton>
    );
});