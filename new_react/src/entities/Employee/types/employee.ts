import {Group} from "@entities/Group";
import {Department} from "@entities/Department";

export interface BaseEmployee {
    id: number,
    username: string,
    first_name: string | null,
    last_name: string | null,
    patronymic: string | null,
    pin_code: number,
    current_department: number | null,
    departments: number[],
    groups: number[],
    current_balance: string,
    token: string,
}

export interface Employee extends Omit<BaseEmployee, 'groups' | 'departments' | 'current_department'>{
    groups: Group[],
    departments: Department[],
    current_department: Department | null,
}