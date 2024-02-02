import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import '@shared/assets/fonts/fontawesome-all.min.css';

import {useAppDispatch, useCurrentUser, useNotification} from "@shared/hooks";
import {getUserRoutes} from "@shared/lib";
import {CURRENT_USER} from "@shared/consts";
import {AutoLogout} from "@features";
import {newWsConnection} from '@shared/api/wsAPI/newWsConnection';
import {IsDesktopContext} from "@app";

export const App = () => {
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const isDesktop = useContext(IsDesktopContext);
    const getRoutes = useCallback(() => {
        return getUserRoutes(currentUser, isDesktop)
    }, [currentUser, isDesktop]);
    const {showNotification} = useNotification();

    const router = createBrowserRouter(getRoutes());
    const initialUser = !!localStorage.getItem(CURRENT_USER);

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (socketRef) {
            socketRef.current?.close()
            socketRef.current = null
        }
        socketRef.current = newWsConnection({
                pin_code: currentUser.pin_code,
                department_number: currentUser.current_department.number,
                showNotification,
                dispatch
            }
        )
    }, [currentUser.current_department.number, currentUser.pin_code, dispatch, showNotification])

    return (
        <div data-bs-theme={'dark'}>
            {!initialUser && <AutoLogout/>}

            <RouterProvider router={router}/>
        </div>
    )
}
