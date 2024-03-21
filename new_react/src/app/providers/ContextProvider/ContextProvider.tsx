import {createContext, ReactNode, useState} from "react";
import {anonEmployee, Employee} from "@entities/Employee";
import {useMediaQuery} from "react-responsive";
import {APP_COMPACT_MODE} from "@shared/consts";

interface ContextProviderProps {
    children: ReactNode;
}

export const IsDesktopContext = createContext<boolean>(false);

interface CompactModeContextType {
    isCompactMode: boolean;
    setCompactMode: (value: boolean) => void;
}

export const AppInCompactMode = createContext<CompactModeContextType | undefined>(undefined);

interface CurrentUserContextType {
    currentUser: Employee;
    setCurrentUser: (value: Employee) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);


export const ContextProvider = (props: ContextProviderProps) => {
    const isDesktop = useMediaQuery({minDeviceWidth: 1201});

    const [currentUser, setCurrentUser] = useState<Employee>(anonEmployee);
    const [isCompactMode, setIsCompactMode] = useState<boolean>(
        !!localStorage.getItem(APP_COMPACT_MODE)
    );

    return (
        <IsDesktopContext.Provider value={isDesktop}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser: setCurrentUser}}>
                <AppInCompactMode.Provider value={{isCompactMode, setCompactMode: setIsCompactMode}}>
                        {props.children}
                </AppInCompactMode.Provider>
            </CurrentUserContext.Provider>
        </IsDesktopContext.Provider>
    );
};
