import React, {createContext, useCallback, useState} from 'react';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {getUserRoutes} from "@shared/lib";
import {Employee, testEmployee} from "@entities/Employee";
import {useMediaQuery} from "react-responsive";
import '@shared/assets/fonts/fontawesome-all.min.css';
import {APP_COMPACT_MODE} from "@shared/consts";


export const IsDesktopContext = createContext<boolean>(false);
export const CurrentUserContext = createContext<Employee | undefined>(undefined);

interface CompactModeContextType {
    isCompactMode: boolean;
    setCompactMode: (value: boolean) => void;
}

export const AppInCompactMode = createContext<CompactModeContextType | undefined>(undefined);

export const App = () => {
    const [user] = useState<Employee>(testEmployee);
    const isDesktop = useMediaQuery({minDeviceWidth: 1201});
    const [isCompactMode, setIsCompactMode] = useState<boolean>(
        !!localStorage.getItem(APP_COMPACT_MODE)
    );

    const getRoutes = useCallback(() => {
        return getUserRoutes(user)
    }, [user])

    const router = createBrowserRouter(getRoutes());

    return (
        <IsDesktopContext.Provider value={isDesktop}>
            <CurrentUserContext.Provider value={testEmployee}>
                <AppInCompactMode.Provider value={{isCompactMode, setCompactMode: setIsCompactMode}}>
                    <div data-bs-theme={'dark'}>
                        <RouterProvider router={router}/>
                    </div>
                </AppInCompactMode.Provider>
            </CurrentUserContext.Provider>
        </IsDesktopContext.Provider>
    )
}
