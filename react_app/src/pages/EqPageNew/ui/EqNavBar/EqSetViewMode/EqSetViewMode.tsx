import React, {memo} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {EmployeePermissions, getEmployeeHasPermissions, getEmployeePinCode} from "entities/Employee";

import {getViewModeFilter} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../model/slice/eqFiltersSlice";
import {ViewMode} from "../../../model/types/eqPageSchema";


export const EqSetViewMode = memo((props: Omit<NavDropdownProps, 'title' | 'children' | 'active'>) => {
    const dispatch = useAppDispatch()
    const viewMode = useSelector(getViewModeFilter)
    const pin_code = useSelector(getEmployeePinCode)
    const bossModePermission = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_BOSS_VIEW_MODE
    ]))
    const behalfPermission = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.BEHALF_ACTIONS
    ]))
    if (!bossModePermission && !behalfPermission) {
        return <></>;
    }

    const bossMode: ViewMode = {'name': 'Режим бригадира', 'key': 1}
    const unfinishedMode: ViewMode = {'name': 'Режим недоделки', 'key': 2}

    const updateCurrentViewMod = (view_mode: ViewMode | undefined) => {
        if (view_mode) {
            dispatch(eqFiltersActions.setCurrentViewMode(view_mode));
            dispatch(eqFiltersActions.listsHasUpdated());
            dispatch(eqFiltersActions.weekDataHasUpdated());
        }
    }
    return (
        <NavDropdown
            title={viewMode?.currentFilter.name || ''}
            active={viewMode?.currentFilter.key !== viewMode?.default.key}
            {...props}
        >
            <Dropdown.ItemText>
                Выбор режима
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            <Dropdown.Item
                active={viewMode?.default.key === viewMode?.currentFilter.key}
                onClick={() => updateCurrentViewMod(viewMode?.default)}
            >
                {viewMode?.default.name}
            </Dropdown.Item>

            {bossModePermission &&
                <Dropdown.Item
                    active={bossMode.key === viewMode?.currentFilter.key}
                    onClick={() => updateCurrentViewMod(bossMode)}
                >
                    {bossMode.name}
                </Dropdown.Item>
            }

            {bossModePermission &&
                <Dropdown.Item
                    active={unfinishedMode.key === viewMode?.currentFilter.key}
                    onClick={() => updateCurrentViewMod(unfinishedMode)}
                >
                    {unfinishedMode.name}
                </Dropdown.Item>
            }

            {bossModePermission &&
                <Dropdown.Divider/>
            }

            {behalfPermission && viewMode?.filters?.map((view_mode) => (
                <div key={view_mode.name}>
                    {view_mode.key !== pin_code &&
                        <Dropdown.Item
                            active={view_mode.key === viewMode?.currentFilter.key}
                            onClick={() => updateCurrentViewMod(view_mode)}
                        >
                            {view_mode.name}
                        </Dropdown.Item>
                    }
                </div>
            ))}

        </NavDropdown>
    );
});