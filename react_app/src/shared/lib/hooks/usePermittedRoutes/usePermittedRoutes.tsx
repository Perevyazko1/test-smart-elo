import {ReactNode, Suspense, useEffect, useState} from 'react';
import {Navigate, Route} from "react-router-dom";

import {getEmployeeHasPermissions} from "entities/Employee";
import {AppRoutes, getAppRouteConfig} from "app/providers/Router";
import {ForbiddenPage} from "pages/ForbiddenPage";

import {useAppSelector} from "../useAppSelector/useAppSelector";
import {Loader} from "../../../ui/Loader/Loader";


export const usePermittedRoutes = () => {
        const [permittedRoutes, setPermittedRoutes] = useState<ReactNode[]>([]);
        const checkPermissions = useAppSelector(getEmployeeHasPermissions);

        useEffect(() => {
                let hasDefaultRoutePermissions = false;
                const routes = Object.values(AppRoutes).reduce((acc: ReactNode[], routeKey) => {
                    const routeConfig = getAppRouteConfig(routeKey);
                    if (checkPermissions(routeConfig.permissions)) {
                        if (routeKey === AppRoutes.EQ) {
                            hasDefaultRoutePermissions = true;
                        }
                        const RouteComponent = routeConfig.element;
                        const route = (
                            <Route
                                key={routeKey}
                                path={`/${routeKey}`}
                                element={
                                    <Suspense fallback={<Loader/>}>
                                        {RouteComponent}
                                    </Suspense>
                                }
                            />
                        );
                        return [...acc, route];
                    }
                    return acc;
                }, []);

                const defaultRoute = hasDefaultRoutePermissions
                    ? <Route key="default" path="*" element={<Navigate to={`/${AppRoutes.DEFAULT}`} replace/>}/>
                    : <Route key="default" path="*" element={
                        <Suspense fallback={<Loader/>}>
                            <ForbiddenPage/>
                        </Suspense>
                    }/>

                setPermittedRoutes([...routes, defaultRoute]);
            }, [checkPermissions]
        );

        return permittedRoutes;
    }
;
