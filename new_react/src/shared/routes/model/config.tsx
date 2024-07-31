import {RouteObject} from "react-router-dom";

import {EqPage} from "@pages/EqPage";
import {TestPage} from "@pages/TestPage";
import {ErrorPage} from "@pages/ErrorPage";
import {APP_PERM} from "@shared/consts";
import {LoginPage} from "@pages/LoginPage";
import {AssignmentPage} from "@pages/AssignmentPage";
import {ProductPage} from "@pages/ProductPage";
import {WagesPage} from "@pages/WagesPage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import {OrdersPage} from "@pages/OrdersPage";
import {OrderDetailPage} from "@pages/OrderDetailPage";
import {TarifficationPage} from "@pages/TarifficationPage";
import {TaskPage} from "@pages/TaskPage";

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
    PRODUCT_DETAILS = 'product_detail',
    TARIFFICATION = 'tariffication',
    WAGES = 'wages',
    SPECIFICATIONS = 'specifications',
    ORDER_DETAILS = 'order_details',
    TASK = 'task',
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
    [AppRoutes.TASK]: {
        route: {path: '/task', element: <TaskPage/>, errorElement: <ErrorPage/>},
        name: 'Задачи',
        mobile: true,
        navigate: true,
        permissions: [APP_PERM.TASK_PAGE]
    },
    [AppRoutes.ASSIGNMENT]: {
        route: {path: '/assignment', element: <AssignmentPage/>, errorElement: <ErrorPage/>},
        name: 'Наряды',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.ASSIGNMENT_PAGE]
    },
    [AppRoutes.TARIFFICATION]: {
        route: {path: '/tariffication', element: <TarifficationPage/>, errorElement: <ErrorPage/>},
        name: 'Сделка',
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
    [AppRoutes.SPECIFICATIONS]: {
        route: {path: '/orders', element: <OrdersPage/>, errorElement: <ErrorPage/>},
        name: 'Заказы',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.SPECIFICATIONS_PAGE]
    },
    [AppRoutes.ORDER_DETAILS]: {
        route: {path: '/orders/:order_id', element: <OrderDetailPage/>, errorElement: <ErrorPage/>},
        name: 'Информация по заказу',
        mobile: false,
        navigate: false,
        permissions: [APP_PERM.SPECIFICATIONS_PAGE]
    },
    [AppRoutes.PRODUCT]: {
        route: {path: '/product', element: <ProductPage/>, errorElement: <ErrorPage/>},
        name: 'Изделия',
        mobile: false,
        navigate: true,
        permissions: [APP_PERM.PRODUCT_PAGE]
    },
    [AppRoutes.PRODUCT_DETAILS]: {
        route: {path: '/product/:productId', element: <ProductDetailsPage/>, errorElement: <ErrorPage/>},
        name: 'Информация по изделию',
        mobile: false,
        navigate: false,
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