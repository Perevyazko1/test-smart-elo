import {Employee} from "@entities/Employee";

export enum TRANSACTION_TYPES {
    cash = "Выдача НАЛ",
    card = "Выдача на карту",
    tax = "Налог",
    accrual = "Начисление",
    debiting = "Списание",
}

export enum TRANSACTION_DETAILS {
    purchase = 'Чек/Закупка',
    wages = 'ЗП',
    prize = 'Премия',
    fine = 'Штраф',
    loan = 'Займ',
    other = 'Другое',
}


export interface BaseTransaction {
    id?: number;
    add_date?: string;
    transaction_type: keyof typeof TRANSACTION_TYPES;
    details: keyof typeof TRANSACTION_DETAILS;
    amount: string;
    starting_balance?: string;
    ending_balance?: string;
    inspect_date?: string;
    description: string;
    is_locked?: boolean;
    employee?: number | null;
    executor?: number | null;
    inspector?: number | null;
    employee_id?: number;
    executor_id?: number;
    inspector_id?: number;
}

type ExtendedFields = 'employee' | 'executor' | 'inspector';

export interface Transaction extends Omit<BaseTransaction, ExtendedFields> {
    employee?: Employee;
    executor?: Employee;
    inspector?: Employee;
}
