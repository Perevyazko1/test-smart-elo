import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee/model/types/employee";

export interface StateSchema {
    authByPinCode: AuthByPinCodeSchema,
    employee: EmployeeSchema,
}