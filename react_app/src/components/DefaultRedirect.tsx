import React from 'react';
import {Navigate} from 'react-router-dom';
import {usePermission} from '@/shared/utils/permissions.ts';
import {APP_PERM} from '@/entities/user';

// Redirects authenticated user from root "/" to the first available section
// Priority: Plan -> Cash -> Shipment -> Sklad -> Unauthorized
export const DefaultRedirect: React.FC = () => {
    const canPlan = usePermission([APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]);
    const canWages = usePermission([APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]);

    if (canPlan) return <Navigate to="/plan" replace/>;
    if (canWages) return <Navigate to="/cash" replace/>;

    // If needed, extend with other sections guarded by SPECIFICATIONS as well
    return <Navigate to="/unauthorized" replace/>;
};
