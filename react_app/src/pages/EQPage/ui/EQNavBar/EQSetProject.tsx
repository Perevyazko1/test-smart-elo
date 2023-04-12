import React, {memo} from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getProjectFilters} from "../../model/selectors/getProjectFilters/getProjectFilters";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {eqActions} from "../../model/slice/eqSlice";

interface EqSetProjectProps {
    className?: string
}


export const EqSetProject = memo((props: EqSetProjectProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const project_filters = useSelector(getProjectFilters)
    const current_project = useSelector(getCurrentProject)

    const mods: Mods = {};

    const updateCurrentProject = (name: string) => {
        dispatch(eqActions.setCurrentProject(name))
    }

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={current_project}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите проект</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {project_filters?.map((filter_name) => (
                <Dropdown.Item
                    key={filter_name}
                    onClick={() => updateCurrentProject(filter_name)}
                    active={filter_name===current_project}
                >
                    {filter_name}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
});