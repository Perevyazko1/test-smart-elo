import {Employee} from "@entities/Employee";
import {AppRoutesConfig} from "@shared/routes";
import {RouteObject} from "react-router-dom";
import {useEffect, useState} from "react";

export const usePermittedRoutes = (user: Employee | undefined): RouteObject[] => {
    const [routes, setRoutes] = useState<RouteObject[]>([]);

    useEffect(() => {
        if (user) {
            const appRoutes = Object.values(AppRoutesConfig);

            const filteredRoutes = appRoutes.filter(route => {
                return route.permissions.some(permission => {
                    return user?.groups.some(group => group.name === permission)
                })
            })

            const result = filteredRoutes.map(route => {
                return route.route
            })

            const defaultRoute = {route: '/', element: filteredRoutes[0].route.element}

            setRoutes([...result, defaultRoute])
        } else {
            setRoutes([AppRoutesConfig.error.route])
        }
    }, [user]);

    return routes;
}