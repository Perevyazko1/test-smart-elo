import React, {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getViewMods} from "../../model/selectors/getViewMods/getViewMods";
import {ViewMode} from "../../model/types/eqSchema";
import {eqActions, initialState} from "../../model/slice/eqSlice";
import {EmployeePermissions, getEmployeeHasPermissions, getEmployeePinCode} from "entities/Employee";

interface EqSetViewModeProps {
    className?: string
}


export const EqSetViewMode = memo((props: EqSetViewModeProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const current_view_mod = useSelector(getCurrentViewMod)
    const view_mods = useSelector(getViewMods)
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
    const normalMode: ViewMode = {'name': 'Личные наряды', 'key': 0}

    const updateCurrentViewMod = (view_mode: ViewMode) => {
        dispatch(eqActions.setCurrentViewMode(view_mode))
    }

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={
                current_view_mod.name === initialState.current_view_mode?.name ?
                    "outline-light" :
                    "outline-light active"
            }
            menuVariant="dark"
            title={current_view_mod.name}
            className={classNames('', mods, [className])}
            {...otherProps}
        >

            <Dropdown.Divider/>

            <Dropdown.Item
                active={normalMode.key === current_view_mod?.key}
                onClick={() => updateCurrentViewMod(normalMode)}
            >
                {normalMode.name}
            </Dropdown.Item>

            {bossModePermission &&
                <Dropdown.Item
                    active={bossMode.key === current_view_mod?.key}
                    onClick={() => updateCurrentViewMod(bossMode)}
                >
                    {bossMode.name}
                </Dropdown.Item>
            }

            {behalfPermission && view_mods?.map((view_mode) => (
                <div key={view_mode.name}>
                    {view_mode.key !== pin_code
                        ?
                        <Dropdown.Item
                            active={view_mode.key === current_view_mod?.key}
                            onClick={() => updateCurrentViewMod(view_mode)}
                        >
                            {view_mode.name}
                        </Dropdown.Item>
                        :
                        <></>
                    }
                </div>

            ))}
        </DropdownButton>
    );
});