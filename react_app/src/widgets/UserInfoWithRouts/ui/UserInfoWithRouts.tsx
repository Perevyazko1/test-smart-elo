import React, {memo, useCallback, useState} from 'react';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {getEmployeeTariffAccess} from "entities/Employee";
import {employeeActions, getEmployeeAuthData} from "entities/Employee";
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
    const employeeTariffAccess = useSelector(getEmployeeTariffAccess)
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
                <Link to={'/eq'}>
                    <Dropdown.ItemText>
                        ЭЛО
                    </Dropdown.ItemText>
                </Link>

                {employeeTariffAccess &&
                    <Link to={'/tax_control'}>
                        <Dropdown.ItemText>
                            Тарификации
                        </Dropdown.ItemText>
                    </Link>
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