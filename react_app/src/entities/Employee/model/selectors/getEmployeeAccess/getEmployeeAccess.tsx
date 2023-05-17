import {StateSchema} from "app/providers/StoreProvider";
import { createSelector } from '@reduxjs/toolkit';

import {EmployeeRole} from "../../consts/employeeConsts";

export const getEmployeeGroups = (state: StateSchema) => state.employee.authData?.groups;

export const getEmployeeIsAdmin = createSelector(
    getEmployeeGroups, (groups) => Boolean(groups?.some(group => group.name === EmployeeRole.ADMIN))
);

export const getEmployeeIsBoss = createSelector(
    getEmployeeGroups, (groups) => Boolean(groups?.some(group => group.name === EmployeeRole.BOSS))
);
export const getEmployeeEQPageAccess = createSelector(
    getEmployeeGroups, (groups) => Boolean(groups?.some(group => group.name === EmployeeRole.EMPLOYEES))
);
export const getEmployeeTariffConfirm = createSelector(
    getEmployeeGroups, (groups) => Boolean(groups?.some(group => group.name === EmployeeRole.RATES))
);

export const getEmployeeTariffPageAccess = createSelector(
    getEmployeeGroups, (groups) => Boolean(groups?.some(group => group.name === EmployeeRole.RATES_CONFIRM))
);
