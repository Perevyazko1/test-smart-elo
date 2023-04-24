import {department} from "entities/Department";

export interface group {
    name: string
}

export interface employee {
    id?: number,
    username?: string,
    first_name?: string,
    last_name?: string,
    pin_code?: number,
    current_department?: department,
    departments?: [department],
    groups?: [group],
}


export interface EmployeeSchema {
    authData?: employee;

    _inited: boolean;
}