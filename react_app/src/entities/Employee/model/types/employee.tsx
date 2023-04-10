import {department} from "entities/Department";

export interface employee {
    id?: number,
    username?: string,
    first_name?: string,
    last_name?: string,
    pin_code?: number,
    current_department?: department,
    departments?: [department],
    groups?: [string],
}


export interface EmployeeSchema {
    authData?: employee;

    _inited: boolean;
}