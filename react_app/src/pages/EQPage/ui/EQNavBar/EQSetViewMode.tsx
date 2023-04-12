import React, {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Dropdown, DropdownButton} from "react-bootstrap";

interface EqSetViewModeProps {
    className?: string
}


export const EqSetViewMode = memo((props: EqSetViewModeProps) => {
    const {
        className,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={"outline-light"}
            menuVariant="dark"
            title={'Личные наряды'}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                <h6 className={"my-0"}>Выберите вид</h6>
            </Dropdown.ItemText>

            <Dropdown.Item>
                Режим бригадира
            </Dropdown.Item>

            <Dropdown.Item>
                Иванов Иван
            </Dropdown.Item>
        </DropdownButton>
    );
});