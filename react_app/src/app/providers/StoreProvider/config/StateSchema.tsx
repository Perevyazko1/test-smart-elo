import {AuthByPinCodeSchema} from "features/AuthByPinCode";
import {EmployeeSchema} from "entities/Employee";

export interface StateSchema {
    authByPinCode: AuthByPinCodeSchema,
    employee: EmployeeSchema,
}