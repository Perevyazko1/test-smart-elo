import React, {useCallback, useEffect, useState} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Spinner} from "react-bootstrap";

import {AutoLogout} from "@features";
import {anonEmployee, Employee} from "@entities/Employee";
import {useCurrentUser, useOnlineStatus} from "@shared/hooks";
import {getUserRoutes} from "@shared/lib";
import {USER_LOCALSTORAGE_TOKEN} from "@shared/consts";
import {$axiosAPI, setRtkHeaders, useWebSocket} from "@shared/api";

export const App = () => {
    const [initialAuth, setInitialAuth] = useState(true);
    const {currentUser, setCurrentUser} = useCurrentUser();
    const getRoutes = useCallback(() => {
        return getUserRoutes(currentUser)
    }, [currentUser]);
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);

    const router = createBrowserRouter(getRoutes());

    const isOnline = useOnlineStatus();

    useWebSocket();

    useEffect(() => {
        const loginHandle = async () => {
            if (token) {
                try {
                    const response = await $axiosAPI.post<Employee>('/staff/base_authentication/');

                    if (response.data.token) {
                        const token = response.data.token;
                        $axiosAPI.defaults.headers.common['Authorization'] = `Token ${token}`;
                        setRtkHeaders({'Authorization': `Token ${token}`});
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

            {!isOnline && (
                <div
                    className={'position-absolute fw-bold text-nowrap p-4 text-danger'}
                    style={{
                        top: '0',
                        left: '0',
                        right: 0,
                        bottom: 0,
                        fontSize: '6rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 100000,
                }}
                >
                    НЕТ СЕТИ 🛜
                </div>
            )}

            {initialAuth ?
                <Spinner className={'position-absolute'} style={{top: '50%', left: '50%', right: '50%'}}/>
                :
                <RouterProvider router={router}/>
            }
        </div>
    )
}
