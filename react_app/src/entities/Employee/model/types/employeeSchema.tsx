import {Department} from "entities/Department";

export interface EmployeeSchema {
    username?: string,
    first_name?: string,
    last_name?: string,
    pin_code?: number,
    current_department?: Department,
    departments?: [Department],
    groups?: [string],

}