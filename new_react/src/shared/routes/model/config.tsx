import {RouteObject} from "react-router-dom";

import {EqPage} from "@pages/EqPage";
import {TestPage} from "@pages/TestPage";
import {ErrorPage} from "@pages/ErrorPage";
import {APP_PERM} from "@shared/consts";
import {LoginPage} from "@pages/LoginPage";
import {AssignmentPage} from "@pages/AssignmentPage";
import {ProductPage} from "@pages/ProductPage";
import {TariffPage} from "@pages/TariffPage";
import {WagesPage} from "@pages/WagesPage";

export interface AppRoute {
    route: RouteObject,
    mobile: boolean,
    name: string,
    navigate: boolean,
    permissions: APP_PERM[],
}

enum AppRoutes {
    LOGIN = 'login',
    EQ = 'eq',
    TEST = 'test',
    ERROR = 'error',
    ASSIGNMENT = 'assignment',
    PRODUCT = 'product',
    TARIFFS = 'tariff',
    WAGES = 'wages',
}

export const AppRoutesConfig: Record<AppRoutes, AppRoute> = {
    [AppRoutes.LOGIN]: {
        route: {path: '/login', element: <LoginPage/>, errorElement: <ErrorPage/>},
        name: 'Вход в систему',
        mobile: true,
        navigate: false,
        permissions: [APP_PERM.ANON]
    },
    [AppRoutes.EQ]: {
        route: {path: '/eq', element: <EqPage/>, errorElement: <ErrorPage/>},
        name: 'ЭЛО',
        mobile: true,
        navigate: true,
        permissions: [APP_PERM.ELO_PAGE]
    },
    [AppRoutes.ASSIGNMENT]: {
        route: {path: '/assignment', element: <AssignmentPage/>, errorElement: <ErrorPage/>},
        name: 'Наряды',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.ASSIGNMENT_PAGE]
    },
    [AppRoutes.TARIFFS]: {
        route: {path: '/tariff', element: <TariffPage/>, errorElement: <ErrorPage/>},
        name: 'Тарификация',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.TARIFFICATION_PAGE]
    },
    [AppRoutes.WAGES]: {
        route: {path: '/wages', element: <WagesPage/>, errorElement: <ErrorPage/>},
        name: 'Зарплата',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.WAGES_PAGE]
    },
    [AppRoutes.PRODUCT]: {
        route: {path: '/product', element: <ProductPage/>, errorElement: <ErrorPage/>},
        name: 'Изделия',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.PRODUCT_PAGE]
    },
    [AppRoutes.TEST]: {
        route: {path: '/test', element: <TestPage/>, errorElement: <ErrorPage/>},
        name: 'Тестовая страница',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.ADMIN]
    },
    [AppRoutes.ERROR]: {
        route: {path: '/error', element: <ErrorPage/>},
        name: 'Страница ошибки',
        mobile: true,
        navigate: false,
        permissions: []
    }
}