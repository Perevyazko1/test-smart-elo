import {SALARY_STATUSES} from "@/shared/consts";

export interface IPayrollRow {
    id: number;
    name: string;
    user_id: number;
    is_locked: boolean;
    week: string;
    comment: string;
    issued_sum: number;
    tax_sum: number;
    card_sum: number;
    start_balance: number;
    cash_payout: number;
    earned_sum: number;
    bonus_sum: number;
    department_name: string;
    has_unconfirmed: boolean;
    is_closed: boolean;
    full_loan_sum: number;
    end_loan_sum: number;
    loan_sum: number;
}

export interface IPayroll {
    id: number;
    state: keyof typeof SALARY_STATUSES;
    date_from: string;
    date_to: string;
    cash_payout: number;
    is_closed: boolean;
    name: string;
}

export type IEarningType = "ЭЛО" | "ДОП" | "На карту" | "Налог" | "Выдача НАЛ" | "Внесение НАЛ" | "ЗАЙМ" | "ПОГ.ЗАЙМА";

export interface IEarning {
    id?: number;
    user: number | null;
    is_locked: boolean;
    crated_at: string;
    target_date: string;
    amount: number;
    earning_type: IEarningType;
    created_by: number;
    approval_by: number;
    comment: string;
    earning_comment: string;
    user_name: string;
    created_by_name: string;
    approval_by_name: string;
}
