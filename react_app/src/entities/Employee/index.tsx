export {getEmployeeInited} from "./model/selectors/getEmployeeInited/getEmployeeInited";

export type {employee} from './model/types/employee';

export {employeeActions, employeeReducer} from "./model/slice/employeeSlice";

export {getEmployeeAuthData} from './model/selectors/getEmployeeAuthData/getEmployeeAuthData';
export {getCurrentDepartment} from "./model/selectors/getCurrentDepartment/getCurrentDepartment";
export {getEmployeeDepartments} from "./model/selectors/getEmployeeDepartments/getEmployeeDepartments";
export {getEmployeePinCode} from "./model/selectors/getEmployeePinCode/getEmployeePinCode";
export {getEmployeeFullName} from "./model/selectors/getEmployeeFullName/getEmployeeFullName";
export {EmployeeRole} from './model/consts/employeeConsts';
export {
    getEmployeeGroups,
    getEmployeeTariffPageAccess,
    getEmployeeIsBoss,
    getEmployeeTariffConfirm,
    getEmployeeEQPageAccess,
    getEmployeeIsAdmin
} from './model/selectors/getEmployeeAccess/getEmployeeAccess'