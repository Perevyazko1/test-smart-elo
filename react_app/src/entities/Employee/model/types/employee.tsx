import {Department} from "entities/Department";

export interface Employee {
    id?: number,
    username?: string,
    first_name?: string,
    last_name?: string,
    pin_code?: number,
    current_department?: Department,
    departments?: [Department],
    groups?: [string],
}


export interface EmployeeSchema {
    authData?: Employee;

    _inited: boolean;
}