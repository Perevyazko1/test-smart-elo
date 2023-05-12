export type {employee} from './model/types/employee';

export {employeeActions, employeeReducer} from "./model/slice/employeeSlice";

export {getEmployeeAuthData} from './model/selectors/getEmployeeAuthData/getEmployeeAuthData';
export {getCurrentDepartment} from "./model/selectors/getCurrentDepartment/getCurrentDepartment";
export {getEmployeeDepartments} from "./model/selectors/getEmployeeDepartments/getEmployeeDepartments";
export {getEmployeePinCode} from "./model/selectors/getEmployeePinCode/getEmployeePinCode";
export {getEmployeeInited} from "./model/selectors/getEmployeeInited/getEmployeeInited";
export {
    getEmployeeIsBoss, getEmployeeTariffAccess
} from "./model/selectors/getEmployeeDepartments/getEmployeeDepartments";
export {getEmployeeFullName} from "./model/selectors/getEmployeeFullName/getEmployeeFullName";

