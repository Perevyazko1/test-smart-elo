import {Employee} from "@entities/Employee";
import {RouteObject} from "react-router-dom";
import {AppRoute, AppRoutesConfig} from "@shared/routes";


export const getUserRouteConfig = (user: Employee | undefined, navOnly: boolean = false,): AppRoute[] => {
    const appRoutes = Object.values(AppRoutesConfig);
    navOnly && appRoutes.filter(route => route.navigate);

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
            navigate: AppRoutesConfig.error.navigate,
            permissions: AppRoutesConfig.error.permissions,
        }
    }

    return [getDefaultRoute(), ...permittedRoutes,]
}


export const getUserRoutes = (user: Employee | undefined): RouteObject[] => {
    const permittedRouteConfig = getUserRouteConfig(user);

    const appRoutes = Object.values(permittedRouteConfig);

    return appRoutes.map(route => {
        return route.route
    })
}