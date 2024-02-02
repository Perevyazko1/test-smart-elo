import {createContext, ReactNode, useState} from "react";
import {Employee, testEmployee} from "@entities/Employee";
import {useMediaQuery} from "react-responsive";
import {APP_COMPACT_MODE, CURRENT_USER} from "@shared/consts";

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

interface IsLoadingContextType {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

export const IsLoadingContext = createContext<IsLoadingContextType | undefined>(undefined);

export const ContextProvider = (props: ContextProviderProps) => {
    const isDesktop = useMediaQuery({minDeviceWidth: 1201});
    const initialUser = localStorage.getItem(CURRENT_USER);

    const [currentUser, setCurrentUser] = useState<Employee>(
        initialUser ? JSON.parse(initialUser) : testEmployee
    );
    const [isCompactMode, setIsCompactMode] = useState<boolean>(
        !!localStorage.getItem(APP_COMPACT_MODE)
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <IsDesktopContext.Provider value={isDesktop}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser: setCurrentUser}}>
                <AppInCompactMode.Provider value={{isCompactMode, setCompactMode: setIsCompactMode}}>
                    <IsLoadingContext.Provider value={{isLoading: isLoading, setIsLoading: setIsLoading}}>
                        {props.children}
                    </IsLoadingContext.Provider>
                </AppInCompactMode.Provider>
            </CurrentUserContext.Provider>
        </IsDesktopContext.Provider>
    )
        ;
};
