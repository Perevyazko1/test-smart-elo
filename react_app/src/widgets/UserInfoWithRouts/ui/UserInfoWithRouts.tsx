import React, {memo, useCallback, useState} from 'react';
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {employeeActions, EmployeePermissions, getEmployeeAuthData, getEmployeeHasPermissions} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {classNames, Mods} from "shared/lib/classNames/classNames";

import {AuditWidget} from "../../AuditWidget";

interface UserInfoWithRoutsProps {
    className?: string
}


export const UserInfoWithRouts = memo((props: UserInfoWithRoutsProps) => {
    const {className, ...otherProps} = props

    const [showModal, setShowModal] = useState(false)

    const dispatch = useAppDispatch()

    const eloPageAccess = useSelector(
        getEmployeeHasPermissions([
            EmployeePermissions.TARIFICATION_PAGE])
    )
    const tariffPageAccess = useSelector(
        getEmployeeHasPermissions([
            EmployeePermissions.TARIFICATION_PAGE])
    )
    const isAdmin = useSelector(
        getEmployeeHasPermissions([
            EmployeePermissions.ADMIN])
    )
    const employee = useSelector(getEmployeeAuthData)

    const logout = useCallback(() => {
        dispatch(employeeActions.logout())
    }, [dispatch])

    const mods: Mods = {};

    return (
        <div className={classNames('mx-2', mods, [className])}>
            <DropdownButton
                variant={"dark"}
                menuVariant={"dark"}
                align={'end'}
                title={employee?.first_name + " " + employee?.last_name}
                {...otherProps}
            >
                {eloPageAccess &&
                    <Dropdown.Item as={NavLink} to={'/'}>
                        ЭЛО
                    </Dropdown.Item>
                }

                {tariffPageAccess &&
                    <Dropdown.Item as={NavLink} to={'/tax_control'}>
                        Тарификации
                    </Dropdown.Item>
                }

                {isAdmin &&
                    <Dropdown.Item to={'/test'} as={NavLink}>
                        Страница разработчика
                    </Dropdown.Item>
                }

                <Dropdown.Item onClick={() => setShowModal(true)}>
                    История действий
                    {showModal && <AuditWidget onHide={() => setShowModal(false)}/>}
                </Dropdown.Item>

                <Dropdown.Divider/>

                <Dropdown.Item onClick={logout}>
                    Выйти
                </Dropdown.Item>
            </DropdownButton>

        </div>
    );
});