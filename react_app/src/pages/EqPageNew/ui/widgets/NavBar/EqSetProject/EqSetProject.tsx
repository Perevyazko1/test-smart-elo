import React, {memo} from 'react';
import {useSelector} from "react-redux";
import {Button, Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getEqProjectFilter} from "../../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../../model/slice/eqFiltersSlice";
import {eqContentDesktopActions} from "../../../../model/slice/eqContentDesktopSlice";

interface EqSetProjectProps extends Omit<NavDropdownProps, 'title' | 'children' | 'active'> {
    callback: () => void;
    mode: 'all' | 'actual';
}

export const EqSetProject = memo((props: EqSetProjectProps) => {
    const {callback, mode, ...otherProps} = props;
    const dispatch = useAppDispatch();
    const projectFilter = useSelector(getEqProjectFilter);

    const updateCurrentProject = (name: string) => {
        dispatch(eqFiltersActions.setCurrentProject(name));
        dispatch(eqContentDesktopActions.allListUpdated());
        dispatch(eqFiltersActions.weekDataHasUpdated());
    }

    return (
        <NavDropdown
            title={projectFilter?.currentFilter || ''}
            active={projectFilter?.currentFilter !== projectFilter?.default}
            {...otherProps}
        >
            <div style={{overflow: 'auto', overflowX: 'hidden', overflowY: 'auto', maxHeight: "85vh"}}>

                <Dropdown.ItemText>
                    Выбор проекта
                </Dropdown.ItemText>

                <Dropdown.Divider/>

                {projectFilter?.filters.map((filter_name) => (
                    <Dropdown.Item
                        key={filter_name}
                        onClick={() => updateCurrentProject(filter_name)}
                        active={filter_name === projectFilter?.currentFilter}
                    >
                        {filter_name}
                    </Dropdown.Item>
                ))}


                <Button className={"w-100 p-0 mt-3"}
                        style={{height: "25px"}}
                        variant={'secondary'}
                        onClick={callback}
                >
                    {mode === 'actual' ? "Показать все" : "Показать актуальные"}
                </Button>

            </div>
        </NavDropdown>
    );
});