import React, {memo, ReactNode} from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {getTCCurrentViewMode} from "../../model/selectors/getTCCurrentViewMode/getTCCurrentViewMode";
import {getTCViewModes} from "../../model/selectors/getTCViewModes/getTCViewModes";
import {taxControlActions} from "../../model/slice/taxControlPageSlice";

interface TCViewModeFilterProps {
    className?: string
    children?: ReactNode
}


export const TCViewModeFilter = memo((props: TCViewModeFilterProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const current_view_mode = useSelector(getTCCurrentViewMode)
    const view_modes = useSelector(getTCViewModes)

    const set_current_view_mode = (view_mode_name: string) => {
        dispatch(taxControlActions.setCurrentViewFilter(view_mode_name))
        dispatch(taxControlActions.hasUpdated());
    }

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={current_view_mode || ''}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите режим</h6>
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            {view_modes?.map((view_mode_name) => (
                <Dropdown.Item
                    onClick={() => set_current_view_mode(view_mode_name)}
                    key={view_mode_name}
                >
                    {view_mode_name}
                </Dropdown.Item>
            ))}


        </DropdownButton>
    );
});