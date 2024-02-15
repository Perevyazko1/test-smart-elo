import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import '@shared/assets/fonts/fontawesome-all.min.css';

import {useAppDispatch, useCurrentUser, useNotification} from "@shared/hooks";
import {getUserRoutes} from "@shared/lib";
import {USER_LOCALSTORAGE_TOKEN} from "@shared/consts";
import {AutoLogout} from "@features";
import {newWsConnection} from '@shared/api/wsAPI/newWsConnection';
import {IsDesktopContext} from "@app";
import {$axiosAPI} from "@shared/api";
import {anonEmployee, Employee} from "@entities/Employee";
import {Spinner} from "react-bootstrap";

export const App = () => {
    const dispatch = useAppDispatch();
    const [initialAuth, setInitialAuth] = useState(true);

    const {currentUser, setCurrentUser} = useCurrentUser();
    const isDesktop = useContext(IsDesktopContext);
    const getRoutes = useCallback(() => {
        return getUserRoutes(currentUser, isDesktop)
    }, [currentUser, isDesktop]);
    const {showNotification} = useNotification();
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);

    const router = createBrowserRouter(getRoutes());

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (socketRef) {
            socketRef.current?.close();
            socketRef.current = null;
        }
        // Далее проверка не анонимный ли пользователь
        if (currentUser.current_department.number !== 0) {
            socketRef.current = newWsConnection({
                    pin_code: currentUser.pin_code,
                    department_number: currentUser.current_department.number,
                    showNotification,
                    dispatch
                }
            )
        }

    }, [currentUser.current_department.number, currentUser.pin_code, dispatch, showNotification])


    useEffect(() => {
        const loginHandle = async () => {
            if (token) {
                try {
                    const response = await $axiosAPI.post<Employee>('/staff/base_authentication/');

                    if (response.data.token) {
                        const token = response.data.token;
                        $axiosAPI.defaults.headers.common['Authorization'] = `Token ${token}`;
                        localStorage.setItem(USER_LOCALSTORAGE_TOKEN, response.data.token);
                    }

                    setCurrentUser(response.data);
                } catch (error) {
                    localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                    setCurrentUser(anonEmployee);
                }
            } else {
                localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                setCurrentUser(anonEmployee);
            }
        }
        loginHandle().then(() => setInitialAuth(false));
    }, [setCurrentUser, token]);

    return (
        <div data-bs-theme={'dark'}>
            {!token && <AutoLogout/>}

            {initialAuth ?
                <Spinner className={'position-absolute'} style={{top: '50%', left: '50%', right: '50%'}}/>
                :
                <RouterProvider router={router}/>
            }
        </div>
    )
}
