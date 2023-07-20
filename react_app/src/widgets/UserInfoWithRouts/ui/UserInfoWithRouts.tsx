import React, {memo, useCallback, useState} from 'react';
import {NavLink, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {AppRoutes, getAppRouteConfig} from "app/providers/Router";
import {employeeActions, getEmployeeAuthData, getEmployeeHasPermissions} from "entities/Employee";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {AuditWidget} from "../../AuditWidget";

export const UserInfoWithRouts = memo((props: Omit<NavDropdownProps, 'title' | 'align' | 'children'>) => {
    const [showModal, setShowModal] = useState(false);
    const checkPermissions = useAppSelector(getEmployeeHasPermissions);

    const location = useLocation();
    const dispatch = useAppDispatch();

    const routesToRender = Object.values(AppRoutes).filter((routeName) => {
        const config = getAppRouteConfig(routeName);
        return config.inNavigate && checkPermissions(config.permissions);
    });

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
            {routesToRender.map((routeName) => {
                const config = getAppRouteConfig(routeName);
                return (
                    <Dropdown.Item
                        key={config.routeName}
                        as={NavLink}
                        to={`/${routeName}`}
                        active={location.pathname === `/${routeName}`}
                    >
                        {config.routeName}
                    </Dropdown.Item>
                );
            })}

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