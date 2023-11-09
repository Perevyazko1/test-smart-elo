import {RouteObject} from "react-router-dom";

import {EqPage} from "@pages/EqPage";
import {TestPage} from "@pages/TestPage";
import {ErrorPage} from "@pages/ErrorPage";
import {APP_PERMISSIONS} from "@shared/consts";
import {LoginPage} from "@pages/LoginPage";

export interface AppRoute {
    route: RouteObject,
    name: string,
    navigate: boolean,
    permissions: APP_PERMISSIONS[],
}

enum AppRoutes {
    LOGIN = 'login',
    EQ = 'eq',
    TEST = 'test',
    ERROR = 'error',
}

export const AppRoutesConfig: Record<AppRoutes, AppRoute> = {
    [AppRoutes.LOGIN]: {
        route: {path: '/login', element: <LoginPage/>, errorElement: <LoginPage/>},
        name: 'Вход в систему',
        navigate: false,
        permissions: [APP_PERMISSIONS.ANON]
    },
    [AppRoutes.EQ]: {
        route: {path: '/eq', element: <EqPage/>},
        name: 'ЭЛО',
        navigate: true,
        permissions: [APP_PERMISSIONS.ELO_PAGE]
    },
    [AppRoutes.TEST]: {
        route: {path: '/test', element: <TestPage/>},
        name: 'Тестовая страница',
        navigate: true,
        permissions: [APP_PERMISSIONS.ADMIN]
    },
    [AppRoutes.ERROR]: {
        route: {path: '/error', element: <ErrorPage/>},
        name: 'Страница ошибки',
        navigate: false,
        permissions: []
    }
}