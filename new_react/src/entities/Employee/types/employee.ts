import {Group} from "@entities/Group";

export interface BaseEmployee {
    id?: number,
    username: string,
    first_name: string,
    last_name: string | null,
    pin_code: number,
    current_department: number | null,
    departments: number[],
    groups: number[],
    current_balance: string,
    token: string,
}

export interface Employee extends Omit<BaseEmployee, 'groups'>{
    groups: Group[],
}