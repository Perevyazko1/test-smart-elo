import {EmployeePermissions} from "entities/Employee";
import React, {ReactNode} from "react";
import {EqPageNew} from "pages/EqPageNew";
import {TaxControlPage} from "pages/TaxControlPage";
import {TestPage} from "pages/TestPage";
import {ForbiddenPage} from "pages/ForbiddenPage";
import {AssignmentPage} from "pages/AssignmentPage";
import {ProductsPage} from "pages/ProductsPage";
import {ProductDetailsPage} from "pages/ProductDetailsPage";
import {TaxControlPageNew} from "../../../../pages/TaxControlPageNew";

export enum AppRoutes {
    EQ = 'eq',
    TEST = 'test_page',
    ASSIGNMENTS = 'assignments',
    TAX = 'tax_control',
    TAX_NEW = 'tax_control_new',
    FORBIDDEN = 'forbidden_page',
    PRODUCTS = 'products',
    PRODUCT_DETAILS = 'products/:id',

    DEFAULT = 'default',
}


export interface RouteConfig {
    routeName: string,
    element: ReactNode,
    permissions: EmployeePermissions[],
    urlParams: string[],
    queryParams: string[],
    inNavigate: boolean,
}


export const appRoutesConfig: Record<AppRoutes, RouteConfig> = {
    [AppRoutes.EQ]: {
        routeName: 'ЭЛО',
        element: <EqPageNew/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        urlParams: [],
        queryParams: ['week', 'year', 'view_mode', 'series_size', 'project'],
        inNavigate: true,
    },
    [AppRoutes.TAX]: {
        routeName: 'Тарификации',
        element: <TaxControlPage/>,
        permissions: [EmployeePermissions.TARIFICATION_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },
    [AppRoutes.TEST]: {
        routeName: 'Тестовая страница',
        element: <TestPage/>,
        permissions: [EmployeePermissions.ADMIN],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },
    [AppRoutes.FORBIDDEN]: {
        routeName: 'Нет доступа',
        element: <ForbiddenPage/>,
        permissions: [],
        urlParams: [],
        queryParams: [],
        inNavigate: false,
    },
    [AppRoutes.ASSIGNMENTS]: {
        routeName: 'Наряды',
        element: <AssignmentPage/>,
        permissions: [EmployeePermissions.ASSIGNMENT_PAGE],
        urlParams: [],
        queryParams: ['series_id', 'department', 'order_by'],
        inNavigate: true,
    },
    [AppRoutes.PRODUCTS]: {
        routeName: 'Изделия',
        element: <ProductsPage/>,
        permissions: [EmployeePermissions.PRODUCT_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },
    [AppRoutes.PRODUCT_DETAILS]: {
        routeName: 'Детализация по изделию',
        element: <ProductDetailsPage/>,
        permissions: [EmployeePermissions.PRODUCT_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: false,
    },
    [AppRoutes.TAX_NEW]: {
        routeName: 'Новая тарификация',
        element: <TaxControlPageNew/>,
        permissions: [EmployeePermissions.TARIFICATION_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },

    [AppRoutes.DEFAULT]: {
        routeName: 'ЭЛО',
        element: <EqPageNew/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: false,
    },
}

export const getAppRouteConfig = (route: AppRoutes): RouteConfig => {
    return appRoutesConfig[route];
}