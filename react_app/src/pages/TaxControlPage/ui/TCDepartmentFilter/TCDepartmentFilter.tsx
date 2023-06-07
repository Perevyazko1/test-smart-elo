import React, {memo} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getEmployeeDepartments} from "entities/Employee";
import {department} from "entities/Department";

import {getTCDepartmentFilter} from "../../model/selectors/getTCDepartmentFilter/getTCDepartmentFilter";
import {taxControlActions} from "../../model/slice/taxControlPageSlice";
import {initialState} from '../../model/slice/taxControlPageSlice';

interface TСDepartmentFilterProps {
    className?: string
}


export const TСDepartmentFilter = memo((props: TСDepartmentFilterProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const current_department = useSelector(getTCDepartmentFilter)
    const departments = useSelector(getEmployeeDepartments)
    const default_department = initialState.department_filter

    const set_department_filter = (department: department) => {
        dispatch(taxControlActions.setDepartmentFilter(department));
        dispatch(taxControlActions.hasUpdated());
    }

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={current_department?.name || ''}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите отдел</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            <Dropdown.Item
                onClick={() => set_department_filter(default_department)}
            >
                {default_department.name}
            </Dropdown.Item>

            {departments?.map((department) => (
                <div key={department.number}>
                    {department.piecework_wages &&
                        <Dropdown.Item
                            onClick={() => set_department_filter(department)}
                        >
                            {department.name}
                        </Dropdown.Item>
                    }
                </div>

            ))}


        </DropdownButton>
    );
});