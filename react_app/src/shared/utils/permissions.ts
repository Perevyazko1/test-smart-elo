import {useMemo} from 'react';
import type {TAppPerm} from "@/entities/user";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";


export const usePermission = (
    requiredPermissions: TAppPerm | TAppPerm[],
): boolean => {
    const {currentUser} = useCurrentUser();

    const hasPermission = useMemo(() => {
        // Получаем массив ключей из userGroups
        const userPermissions = currentUser?.groups.map(group => group.name);

        if (typeof requiredPermissions === 'string') {
            return userPermissions?.includes(requiredPermissions);
        }

        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.some(permission =>
                userPermissions?.includes(permission)
            );
        }

        return false;
    }, [requiredPermissions, currentUser?.groups]);

    return hasPermission || false;
};