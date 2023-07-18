import {EmployeePermissions} from "entities/Employee";
import React, {ReactNode} from "react";
import {EqPageNew} from "pages/EqPageNew";
import {TaxControlPage} from "pages/TaxControlPage";
import {TestPage} from "pages/TestPage";
import {ForbiddenPage} from "pages/ForbiddenPage";
import {AssignmentPage} from "pages/AssignmentPage";

export enum AppRoutes {
    EQ = 'eq',
    TEST = 'test_page',
    ASSIGNMENTS = 'assignments',
    TAX = 'tax_control',
    FORBIDDEN = 'forbidden_page',
}


interface RouteConfig {
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
        permissions: [EmployeePermissions.ELO_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },
    [AppRoutes.TEST]: {
        routeName: 'Тестовая страница',
        element: <TestPage/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: true,
    },
    [AppRoutes.FORBIDDEN]: {
        routeName: 'Нет доступа',
        element: <ForbiddenPage/>,
        permissions: [EmployeePermissions.ELO_PAGE],
        urlParams: [],
        queryParams: [],
        inNavigate: false,
    },
    [AppRoutes.ASSIGNMENTS]: {
        routeName: 'Наряды',
        element: <AssignmentPage/>,
        permissions: [EmployeePermissions.ADMIN],
        urlParams: ['id'],
        queryParams: ['series_id', 'department', 'order_by'],
        inNavigate: true,
    },
}

export const getAppRouteConfig = (route: AppRoutes): RouteConfig => {
    return appRoutesConfig[route];
}