import React, {useCallback} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import {useCurrentUser} from "@shared/hooks";
import {getUserRoutes} from "@shared/lib";
import '@shared/assets/fonts/fontawesome-all.min.css';
import {ModalProvider} from "@app/providers/ModalProvider/ModalProvider";

export const App = () => {
    const {currentUser} = useCurrentUser();

    const getRoutes = useCallback(() => {
        return getUserRoutes(currentUser)
    }, [currentUser])

    const router = createBrowserRouter(getRoutes());

    return (
        <div data-bs-theme={'dark'}>
            <ModalProvider>
                <RouterProvider router={router}/>
            </ModalProvider>
        </div>
    )
}
