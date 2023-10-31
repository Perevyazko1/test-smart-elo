import {EmployeePermissions} from "entities/Employee";
import React, {ReactNode} from "react";
import {EqPageNew} from "pages/EqPageNew";
import {TestPage} from "pages/TestPage";
import {ForbiddenPage} from "pages/ForbiddenPage";
import {AssignmentPage} from "pages/AssignmentPage";
import {ProductsPage} from "pages/ProductsPage";
import {ProductDetailsPage} from "pages/ProductDetailsPage";
import {TariffPage} from "pages/TariffPage";
import {WagesPage} from "pages/WagesPage";
import {EqPage} from "pages/EqPage";

export enum AppRoutes {
    EQ = 'eq',
    EQ_NEW = 'eq_new',
    TEST = 'test_page',
    ASSIGNMENTS = 'assignments',
    TARIFFS = 'tariff_cards',
    FORBIDDEN = 'forbidden_page',
    PRODUCTS = 'products',
    WAGES = 'wages_page',
    PRODUCT_DETAILS = 'products/:id',

    DEFAULT = 'default',
}


export interface RouteConfig {
    routeName: string,
    element: ReactNode,
    permissions: EmployeePermissions[],
    inNavigate: boolean,
}


export const appRoutesConfig: Record<AppRoutes, RouteConfig> = {
    [AppRoutes.EQ]: {
        routeName: 'ЭЛО',
        element: <EqPage/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        inNavigate: true,
    },
    [AppRoutes.EQ_NEW]: {
        routeName: 'ЭЛО_',
        element: <EqPageNew/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        inNavigate: true,
    },
    [AppRoutes.TEST]: {
        routeName: 'Тестовая страница',
        element: <TestPage/>,
        permissions: [EmployeePermissions.ADMIN],
        inNavigate: true,
    },
    [AppRoutes.WAGES]: {
        routeName: 'Заработная плата',
        element: <WagesPage/>,
        permissions: [EmployeePermissions.WAGES_PAGE],
        inNavigate: true,
    },
    [AppRoutes.FORBIDDEN]: {
        routeName: 'Нет доступа',
        element: <ForbiddenPage/>,
        permissions: [],
        inNavigate: false,
    },
    [AppRoutes.ASSIGNMENTS]: {
        routeName: 'Наряды',
        element: <AssignmentPage/>,
        permissions: [EmployeePermissions.ASSIGNMENT_PAGE],
        inNavigate: true,
    },
    [AppRoutes.PRODUCTS]: {
        routeName: 'Изделия',
        element: <ProductsPage/>,
        permissions: [EmployeePermissions.PRODUCT_PAGE],
        inNavigate: true,
    },
    [AppRoutes.PRODUCT_DETAILS]: {
        routeName: 'Детализация по изделию',
        element: <ProductDetailsPage/>,
        permissions: [EmployeePermissions.PRODUCT_PAGE],
        inNavigate: false,
    },
    [AppRoutes.TARIFFS]: {
        routeName: 'Тарификации',
        element: <TariffPage/>,
        permissions: [EmployeePermissions.TARIFICATION_PAGE],
        inNavigate: true,
    },

    [AppRoutes.DEFAULT]: {
        routeName: 'ЭЛО',
        element: <EqPage/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        inNavigate: false,
    },
}

export const getAppRouteConfig = (route: AppRoutes): RouteConfig => {
    return appRoutesConfig[route];
}