import React, {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getCurrentViewMod} from "../../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getViewMods} from "../../model/selectors/getViewMods/getViewMods";
import {ViewMode} from "../../model/types/eqSchema";
import {eqActions, initialState} from "../../model/slice/eqSlice";
import {getEmployeePinCode} from "../../../../entities/Employee";

interface EqSetViewModeProps {
    className?: string
}


export const EqSetViewMode = memo((props: EqSetViewModeProps) => {
    const {className, ...otherProps} = props

    const dispatch = useAppDispatch()
    const current_view_mod = useSelector(getCurrentViewMod)
    const view_mods = useSelector(getViewMods)
    const pin_code = useSelector(getEmployeePinCode)

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
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите вид</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {view_mods?.map((view_mode) => (
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