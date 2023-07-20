import {StateSchema} from "app/providers/StoreProvider";
import {createSelector} from '@reduxjs/toolkit';

import {EmployeePermissions} from "../../consts/employeeConsts";

export const getEmployeeGroups = (state: StateSchema) => state.employee.authData?.groups;

export const getEmployeeHasPermissions = createSelector(
    [getEmployeeGroups],
    (user_groups) => (permissions: EmployeePermissions[]) => {
        if (!user_groups) {
            return false
        }

        return permissions?.every((permission) =>
            user_groups.some((group) => group.name === permission))
    }
);