import React, {memo, useCallback, useState} from 'react';
import {NavLink, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {employeeActions, EmployeePermissions, getEmployeeAuthData, getEmployeeHasPermissions} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {AuditWidget} from "../../AuditWidget";


export const UserInfoWithRouts = memo((props: Omit<NavDropdownProps, 'title' | 'align' | 'children'>) => {
    const [showModal, setShowModal] = useState(false)

    const location = useLocation()
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


    return (
        <NavDropdown
            align={'end'}
            title={employee?.first_name + " " + employee?.last_name}
            {...props}
        >
            {eloPageAccess &&
                <Dropdown.Item
                    as={NavLink}
                    to={'/'}
                    active={location.pathname === '/'}
                >
                    ЭЛО
                </Dropdown.Item>
            }

            {tariffPageAccess &&
                <Dropdown.Item
                    as={NavLink}
                    to={'/tax_control'}
                    active={location.pathname === '/tax_control'}
                >
                    Тарификации
                </Dropdown.Item>
            }

            {tariffPageAccess &&
                <Dropdown.Item
                    as={NavLink}
                    to={'/assignments'}
                    active={location.pathname === '/assignments'}
                >
                    Наряды
                </Dropdown.Item>
            }

            {isAdmin &&
                <Dropdown.Item
                    to={'/test'}
                    as={NavLink}
                    active={location.pathname === '/test'}
                >
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
        </NavDropdown>
    );
});