import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useCurrentUser} from '@/shared/utils/useCurrentUser.ts';
import {LoginPage} from "@/pages/login/LoginPage.tsx"; // Убедись, что путь правильный


interface RequireAuthProps {
    children?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({children}) => {
    const {currentUser, inited} = useCurrentUser(); // Предположим, что useCurrentUser возвращает isLoading

    if (!inited) {
        return <div>Проверка входа</div>;
    }

    if (!currentUser) {
        return <LoginPage/>;
    }

    return children ? <>{children}</> : <Outlet/>;
};