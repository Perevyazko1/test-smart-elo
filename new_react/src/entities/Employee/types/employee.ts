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

type ExtendedFields = 'groups' | 'departments' | 'current_department' | 'permanent_department';

export interface Employee extends Omit<BaseEmployee, ExtendedFields>{
    groups: Group[],
    departments: Department[],
    current_department: Department | null,
    permanent_department: Department | null,
}

export interface GroupedEmployeeItem {
    group: string,
    user: Employee,
}