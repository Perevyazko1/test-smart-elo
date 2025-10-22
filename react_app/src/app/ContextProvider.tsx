import {createContext, type ReactNode, useEffect, useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import {$axios} from "@/shared/api";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {toast} from "sonner";

import type {IUser} from "@/entities/user";


interface ContextProviderProps {
    children: ReactNode;
}


interface CurrentUserContextType {
    currentUser?: IUser;
    setCurrentUser: (value?: IUser) => void;
    inited: boolean;
    setInited: (value: boolean) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // чтобы не дергал при возврате к вкладке
            retry: 1,                    // количество повторов при ошибке
            staleTime: 1000 * 60 * 5,    // 5 минут данные считаются актуальными
        },
    },
});


export const ContextProvider = (props: ContextProviderProps) => {
    const [currentUser, setCurrentUser] = useState<IUser>();
    const [inited, setInited] = useState(false);
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);

    useEffect(() => {
        if (!inited) {
            const loginHandle = async () => {
                if (token) {
                    try {
                        toast.promise($axios.post<IUser>('/staff/base_authentication/'), {
                            loading: 'Вход в систему...',
                            success: (data) => {
                                if (data.data.token) {
                                    const token = data.data.token;
                                    $axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                                    localStorage.setItem(USER_LOCALSTORAGE_TOKEN, data.data.token);
                                    setCurrentUser(data.data);
                                    return `${data.data.first_name}, успешный вход в систему!`;
                                } else {
                                    return `Ошибка входа, попробуйте еще раз или обратитесь к администратору`
                                }
                            },
                            error: () => {
                                setCurrentUser(undefined)
                                return `Ошибка входа, попробуйте еще раз или обратитесь к администратору`
                            }
                        });
                    } catch (error) {
                        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                        setCurrentUser(undefined);
                    }
                } else {
                    localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                    setCurrentUser(undefined);
                }
            }
            loginHandle().then(() => setInited(true));
        }
    }, [inited]);

    return (
        <QueryClientProvider client={queryClient}>
            <CurrentUserContext.Provider value={{
                currentUser,
                setCurrentUser,
                inited,
                setInited,
            }}>
                {props.children}
            </CurrentUserContext.Provider>
        </QueryClientProvider>
    );
};
