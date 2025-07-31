import {SALARY_STATUSES} from "@/shared/consts";
import type {IUser} from "@/entities/user";

export interface IPayrollRow {
    id: number;
    name: string;
    user: IUser;
    is_locked: boolean;
    week: string;
    comment: string;
    issued_sum: number | null;
    ip_sum: number | null;
    tax_sum: number | null;
    card_sum: number | null;
    balance_sum: number | null;
    cash_payout: number | null;
    earned_sum: number | null;
    bonus_sum: number | null;
    department_name: string;
    has_unconfirmed: boolean;
    hide_balance: boolean;
    is_closed: boolean;
    full_loan_sum:  number | null;
    end_loan_sum:  number | null;
    loan_sum:  number | null;
}

export interface IPayroll {
    id: number;
    state: keyof typeof SALARY_STATUSES;
    date_from: string;
    date_to: string;
    cash_payout: number | null;
    is_closed: boolean;
    name: string;
    description?: string | null;
}

export type IEarningType =
    "ЭЛО" |
    "ДОП" |
    "На карту" |
    "Налог" |
    "Выдача НАЛ" |
    "Внесение НАЛ" |
    "ЗАЙМ" |
    "ПОГ.ЗАЙМА" |
    "ИП";

export interface IEarning {
    id: number;
    user: IUser | null;
    is_locked: boolean;
    created_at: string;
    cash_date: string;
    target_date: string;
    amount: number;
    earning_type: IEarningType;
    created_by: number;
    approval_by: number;
    comment: string;
    earning_comment: string;
    created_by_name: string;
    approval_by_name: string;
}

export interface IUpdateEarning extends Omit<IEarning, 'user'> {
    user_id: number | null;
}


export interface ICreateEarning extends Omit<IUpdateEarning, 'id'> {
}
