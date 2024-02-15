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

    const permittedRoutes = appRoutes.filter(route => {
        return route.permissions.some(permission => {
            return user?.groups.some(group => group.name === permission)
        })
    })


    const getDefaultRoute = (): AppRoute => {
        if (permittedRoutes.length > 0) {
            const firstRoute = permittedRoutes.shift();

            if (firstRoute) {
                return {
                    route: {
                        path: '/',
                        element: firstRoute.route.element,
                        errorElement: firstRoute.route.errorElement,
                    },
                    mobile: firstRoute.mobile,
                    name: firstRoute.name,
                    navigate: firstRoute.navigate,
                    permissions: firstRoute.permissions,
                }
            }
        }

        return {
            route: {
                path: '/',
                element: AppRoutesConfig.error.route.element,
                errorElement: AppRoutesConfig.error.route.element,
            },
            name: AppRoutesConfig.error.name,
            mobile: AppRoutesConfig.error.mobile,
            navigate: AppRoutesConfig.error.navigate,
            permissions: AppRoutesConfig.error.permissions,
        }
    }

    return [getDefaultRoute(), ...permittedRoutes,]
}


export const getUserRoutes = (user: Employee | undefined, isDesktop: boolean): RouteObject[] => {
    const permittedRouteConfig = getUserRouteConfig(user, false, isDesktop);

    const appRoutes = Object.values(permittedRouteConfig);

    const routes = appRoutes.map(route => {
        return route.route;
    });

    // Добавьте редирект для всех неопределенных путей
    routes.push({
        path: '*',
        element: <Navigate to={user ? '/' : '/login'} replace />,
    });

    return routes;
}