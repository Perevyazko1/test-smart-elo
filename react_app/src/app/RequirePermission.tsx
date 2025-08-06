import type {TAppPerm} from "@/entities/user";
import {usePermission} from "@/shared/utils/permissions.ts";
import {Navigate, Outlet} from "react-router-dom";


interface RequirePermissionProps {
    requiredPermissions: TAppPerm | TAppPerm[],
}

export const RequirePermission = (props: RequirePermissionProps) => {
    const {requiredPermissions} = props;

    const hasPermission = usePermission(requiredPermissions);

    if (!hasPermission) {
        // Если прав нет, перенаправляем на страницу, например, с ошибкой "Отказано в доступе"
        return <Navigate to="/unauthorized" replace/>;
    }

    return <Outlet />;
};