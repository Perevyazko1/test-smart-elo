import React, {memo, useCallback} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useSelector} from "react-redux";
import {employeeActions, getEmployeeAuthData} from "../../../entities/Employee";
import {Link} from "react-router-dom";
import {useAppDispatch} from "../../../shared/lib/hooks/useAppDispatch/useAppDispatch";

interface UserInfoWithRoutsProps {
    className?: string
}


export const UserInfoWithRouts = memo((props: UserInfoWithRoutsProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const employee = useSelector(getEmployeeAuthData)

    const logout = useCallback(() => {
        dispatch(employeeActions.logout())
    }, [dispatch])

    const mods: Mods = {};

    return (
        <div className={classNames('mx-2', mods, [className])}>
            <DropdownButton
                variant={"dark"}
                menuVariant="dark"
                title={employee?.first_name + " " + employee?.last_name}
                {...otherProps}
            >
                <Dropdown.ItemText>
                    <h6 className={"my-0"}>Разделы</h6>
                </Dropdown.ItemText>

                <Dropdown.Divider/>

                <Link to={'/eq'}>
                    <Dropdown.ItemText>
                        Электронная очередь
                    </Dropdown.ItemText>
                </Link>

                <Link to={'/tax_control'}>
                    <Dropdown.ItemText>
                        Тарификации
                    </Dropdown.ItemText>
                </Link>
            </DropdownButton>

            <h4 className={'text-light'}>
                |
            </h4>

            <button type={"button"} className={'btn btn-dark'} onClick={logout}>
                    Выйти
            </button>
        </div>

    );
});