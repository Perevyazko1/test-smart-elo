import {createContext, ReactNode, useEffect, useState} from "react";
import {anonEmployee, Employee, useEmployeeList} from "@entities/Employee";
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

interface UserListContextType {
    isLoading: boolean;
    usersList: Employee[] | undefined;
}

export const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);
export const UserListContext = createContext<UserListContextType | undefined>(undefined);


export const AudioContext = createContext<HTMLAudioElement | null>(null);


export const ContextProvider = (props: ContextProviderProps) => {
    const isDesktop = useMediaQuery({minWidth: 1279});
    const {data: usersList, isLoading} = useEmployeeList({});

    const [clickSound, setClickSound] = useState<HTMLAudioElement | null>(null);
    const [currentUser, setCurrentUser] = useState<Employee>(anonEmployee);
    const [isCompactMode, setIsCompactMode] = useState<boolean>(
        !!localStorage.getItem(APP_COMPACT_MODE)
    );

    useEffect(() => {
        const audio = new Audio('/click.mp3');
        setClickSound(audio);
    }, []);

    return (
        <IsDesktopContext.Provider value={isDesktop}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser: setCurrentUser}}>
                <UserListContext.Provider value={{isLoading, usersList}}>
                    <AppInCompactMode.Provider value={{isCompactMode, setCompactMode: setIsCompactMode}}>
                        <AudioContext.Provider value={clickSound}>
                            {props.children}
                        </AudioContext.Provider>
                    </AppInCompactMode.Provider>
                </UserListContext.Provider>
            </CurrentUserContext.Provider>
        </IsDesktopContext.Provider>
    );
};
