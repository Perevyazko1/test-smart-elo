import React, {memo, useEffect} from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getProjectFilters} from "../../model/selectors/getProjectFilters/getProjectFilters";
import {getCurrentProject} from "../../model/selectors/getCurrentProject/getCurrentProject";
import {eqActions, initialState} from "../../model/slice/eqSlice";
import {fetchProjectFilters} from "../../model/service/fetchProjects/fetchProjects";
import {eqAwaitListActions} from "../../model/slice/awaitListSlice";
import {eqInWorkListActions} from "../../model/slice/inWorkListSlice";
import {eqReadyListActions} from "../../model/slice/readyListSlice";

interface EqSetProjectProps {
    className?: string
}


export const EqSetProject = memo((props: EqSetProjectProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const project_filters = useSelector(getProjectFilters)
    const current_project = useSelector(getCurrentProject)

    const mods: Mods = {};

    useEffect(() => {
        dispatch(fetchProjectFilters({}))
    }, [dispatch])

    const updateCurrentProject = (name: string) => {
        dispatch(eqActions.setCurrentProject(name))
        dispatch(eqAwaitListActions.hasUpdated())
        dispatch(eqInWorkListActions.hasUpdated())
        dispatch(eqReadyListActions.hasUpdated())
        dispatch(eqActions.weekInfoUpdated())
    }

    return (
        <DropdownButton
            variant={current_project === initialState.current_project ? "outline-light" : "outline-light active"}
            menuVariant="dark"
            title={current_project}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                Выбор проекта
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {project_filters?.map((filter_name) => (
                <Dropdown.Item
                    key={filter_name}
                    onClick={() => updateCurrentProject(filter_name)}
                    active={filter_name === current_project}
                >
                    {filter_name}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
});