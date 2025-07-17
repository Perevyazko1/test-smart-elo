import {createContext, type ReactNode, useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import type {IUser} from "@/pages/login/model/types";


interface ContextProviderProps {
    children: ReactNode;
}


interface CurrentUserContextType {
    currentUser?: IUser;
    setCurrentUser: (value?: IUser) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

const queryClient = new QueryClient();


export const ContextProvider = (props: ContextProviderProps) => {
    const [currentUser, setCurrentUser] = useState<IUser>();

    return (

        <QueryClientProvider client={queryClient}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser: setCurrentUser}}>
                {props.children}
            </CurrentUserContext.Provider>
        </QueryClientProvider>
    );
};
