import {Employee} from "@entities/Employee";
import {Navigate, RouteObject} from "react-router-dom";
import {AppRoute, AppRoutesConfig} from "@shared/routes";


export const getUserRouteConfig = (user: Employee | undefined, navOnly: boolean = false, isDesktop: boolean = true): AppRoute[] => {
    let appRoutes = Object.values(AppRoutesConfig);

    if (navOnly) {
        appRoutes = appRoutes.filter(route => route.navigate);
    }
    if (!isDesktop) {
        appRoutes = appRoutes.filter(route => route.mobile);
    }

    return appRoutes.filter(route => {
        return route.permissions.length === 0 || route.permissions.some(permission => {
            return user?.groups.some(group => group.name === permission)
        });
    })
}


export const getUserRoutes = (user: Employee | undefined, isDesktop: boolean): RouteObject[] => {
    const permittedRouteConfig = getUserRouteConfig(user, false, isDesktop);

    const appRoutes = Object.values(permittedRouteConfig);

    const routes = appRoutes.map(route => {
        return route.route;
    });

    // Получаем первый доступный роут
    const firstAvailableRoute = appRoutes[0]?.route.path || '/login';

    // Добавляем редирект для главной страницы
    routes.push({
        path: '/',
        element: <Navigate to={firstAvailableRoute} replace />,
    });

    // Добавьте редирект для всех неопределенных путей
    routes.push({
        path: '*',
        element: <Navigate to={user ? firstAvailableRoute : '/login'} replace />,
    });

    return routes;
};