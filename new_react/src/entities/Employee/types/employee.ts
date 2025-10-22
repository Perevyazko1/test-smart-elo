import {Group} from "@entities/Group";
import {Department} from "@entities/Department";

export interface BaseEmployee {
    id: number,
    username: string,
    first_name: string | null,
    last_name: string | null,
    patronymic: string | null,
    description: string | null,
    boss: number | null,
    attention: boolean,
    is_active: boolean,
    pin_code: number,
    current_department: number | null,
    permanent_department: number | null,
    departments: number[],
    favorite_users: number[],
    groups: number[],
    current_balance: string,
    piecework_wages: boolean,
    token: string,
}

type ExtendedFields = 'groups';

export interface Employee extends Omit<BaseEmployee, ExtendedFields>{
    groups: Group[],
    current_department_details: Department | null,
}

export interface GroupedEmployeeItem {
    group: string,
    user: Employee,
}