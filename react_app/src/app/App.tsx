import {useState, useEffect} from "react";

import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {Navbar} from "@/widgets/navbar/Navbar.tsx";
import {LoginPage} from "@/pages/login/LoginPage.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import type {IUser} from "@/pages/login/model/types.ts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {$axios} from "@/shared/api";
import { ContextProvider } from "./ContextProvider";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";



export const App = () => {
    const [initialAuth, setInitialAuth] = useState(true);
    const {currentUser, setCurrentUser} = useCurrentUser();
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);

    const logoutHandle = () => {
        setCurrentUser(undefined);
        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
    }

    useEffect(() => {
        if (initialAuth) {
            const loginHandle = async () => {
                if (token) {
                    try {
                        const response = await $axios.post<IUser>(
                            '/staff/base_authentication/'
                        );

                        if (response.data.token) {
                            const token = response.data.token;
                            $axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                            localStorage.setItem(USER_LOCALSTORAGE_TOKEN, response.data.token);
                        }

                        setCurrentUser(response.data);
                    } catch (error) {
                        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                        setCurrentUser(undefined);
                    }
                } else {
                    localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
                    setCurrentUser(undefined);
                }
            }
            loginHandle().then(() => setInitialAuth(false));
        }
    }, [setCurrentUser, token, initialAuth]);

    return (
        <div className={'bg-gray-500 min-h-screen'}>
            <Toaster position="top-center" toastOptions={{duration: 1400}}/>
            <div>
                {initialAuth ? (<div>Загрузка...</div>) : (
                    <div>
                        <Navbar>
                            <Btn
                                onClick={logoutHandle}
                            >
                                Выйти
                            </Btn>
                        </Navbar>
                        {currentUser ? (
                            <SalaryPage/>
                        ) : (
                            <LoginPage
                                onLogin={user => setCurrentUser(user)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
