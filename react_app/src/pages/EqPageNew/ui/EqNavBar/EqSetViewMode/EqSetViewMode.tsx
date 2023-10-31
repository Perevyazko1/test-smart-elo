import React, {memo, useEffect, useState} from 'react';
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {useQueryParams} from "shared/lib/hooks/useQueryParams/useQueryParams";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {EmployeePermissions, getEmployeeHasPermissions, getEmployeePinCode} from "entities/Employee";

import {getViewModeFilter} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../model/slice/eqFiltersSlice";
import {ViewMode} from "../../../model/types/eqPageSchema";


interface EqSetViewModeProps extends Omit<NavDropdownProps, 'title' | 'children' | 'active'> {
}


export const EqSetViewMode = memo((props: EqSetViewModeProps) => {
    const {...otherProps} = props;

    const {setQueryParam, queryParameters, initialLoad} = useQueryParams();
    const dispatch = useAppDispatch();
    const pin_code = useAppSelector(getEmployeePinCode);
    const stateViewMode = useAppSelector(getViewModeFilter);
    const checkPermissions = useAppSelector(getEmployeeHasPermissions);
    const bossModePermission = checkPermissions([
        EmployeePermissions.ELO_BOSS_VIEW_MODE
    ]);
    const behalfPermission = checkPermissions([
        EmployeePermissions.BEHALF_ACTIONS
    ]);

    const initViewModes: ViewMode[] = bossModePermission ? [
    ] : [];

    const [viewModes, setViewModes] = useState<ViewMode[]>(initViewModes);

    useEffect(() => {
        if (stateViewMode?.filters) {
            setViewModes([...viewModes, ...stateViewMode.filters])
        }
    }, [stateViewMode?.filters])


    useEffect(() => {
        const mode = viewModes.find(item => String(item.key) === queryParameters.view_mode);
        if (mode?.key !== stateViewMode?.currentFilter.key) {
            if (mode) {
                dispatch(eqFiltersActions.setCurrentViewMode(mode));
            } else if (stateViewMode?.default) {
                dispatch(eqFiltersActions.setCurrentViewMode(stateViewMode.default));
            }
        }
    }, [initialLoad, queryParameters, dispatch, stateViewMode?.currentFilter, viewModes]);

    if (!bossModePermission && !behalfPermission) {
        return <></>;
    }

    const updateCurrentViewMod = (view_mode: ViewMode | undefined) => {
        if (view_mode) {
            if (view_mode.key === stateViewMode?.default.key) {
                setQueryParam('view_mode', '');
            } else {
                setQueryParam('view_mode', String(view_mode.key));
            }
            dispatch(eqFiltersActions.listsHasUpdated());
            dispatch(eqFiltersActions.weekDataHasUpdated());
        }
    }

    return (
        <NavDropdown
            title={stateViewMode?.currentFilter.name || ''}
            active={!!queryParameters.view_mode}
            {...otherProps}
        >
            <Dropdown.ItemText>
                Выбор режима
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            <Dropdown.Item
                active={!queryParameters?.view_mode}
                onClick={() => updateCurrentViewMod(stateViewMode?.default)}
            >
                {stateViewMode?.default.name}
            </Dropdown.Item>

            {behalfPermission && stateViewMode?.filters?.map((view_mode) => (
                <div key={view_mode.key}>
                    {view_mode.key !== pin_code &&
                        <Dropdown.Item
                            active={view_mode.key === queryParameters.view_mode}
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