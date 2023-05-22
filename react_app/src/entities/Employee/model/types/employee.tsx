import {department} from "entities/Department";

import {EmployeePermissions} from "../consts/employeeConsts";

export interface group {
    name: EmployeePermissions;
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