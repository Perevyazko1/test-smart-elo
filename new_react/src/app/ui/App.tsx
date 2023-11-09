import React, {useCallback} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import {useCurrentUser} from "@shared/hooks";
import {getUserRoutes} from "@shared/lib";
import '@shared/assets/fonts/fontawesome-all.min.css';

import {ContextProvider} from "../providers/ContextProvider/ContextProvider";


export const App = () => {
    const {currentUser} = useCurrentUser();

    const getRoutes = useCallback(() => {
        return getUserRoutes(currentUser)
    }, [currentUser])

    const router = createBrowserRouter(getRoutes());

    return (
        <div data-bs-theme={'dark'}>
            <RouterProvider router={router}/>
        </div>
    )
}
