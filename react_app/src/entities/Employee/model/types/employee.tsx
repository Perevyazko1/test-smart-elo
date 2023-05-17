import {department} from "entities/Department";

import {EmployeeRole} from "../consts/employeeConsts";

export interface group {
    name: EmployeeRole
}

export interface employee {
    id?: number,
    username?: string,
    first_name?: string,
    last_name?: string,
    pin_code?: number,
    current_department?: department,
    departments?: department[],
    groups?: group[],
}


export interface EmployeeSchema {
    authData?: employee;

    _inited: boolean;
}