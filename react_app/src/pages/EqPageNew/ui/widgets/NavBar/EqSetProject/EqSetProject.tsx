import React, {memo, useState} from 'react';
import {useSelector} from "react-redux";
import {Button, Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getEqProjectFilter} from "../../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqActions} from "../../../../../EQPage";


export const EqSetProject = memo((props: Omit<NavDropdownProps, 'title' | 'children' | 'active'>) => {
    const dispatch = useAppDispatch()
    const projectFilter = useSelector(getEqProjectFilter)
    const [currentMode, setCurrentMode] = useState<"active" | "all">('active')

    // TODO добавить запрос проектов

    const updateCurrentProject = (name: string) => {
        dispatch(eqActions.setCurrentProject(name))
        // TODO обновление страниц
    }

    return (
        <NavDropdown
            title={projectFilter?.currentFilter || ''}
            active={projectFilter?.currentFilter !== projectFilter?.default}
            {...props}
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

                {currentMode === 'active'
                    ?
                    <Button className={"w-100 p-0 mt-3"}
                            style={{height: "25px"}}
                            variant={'secondary'}
                            onClick={() => setCurrentMode('all')}
                    >
                        Показать все
                    </Button>
                    :
                    <Button className={"w-100 p-0 mt-3"}
                            style={{height: "25px"}}
                            variant={'secondary'}
                            onClick={() => setCurrentMode('active')}
                    >
                        Показать активные
                    </Button>
                }
            </div>
        </NavDropdown>
    );
});