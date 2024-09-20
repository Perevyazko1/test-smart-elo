import { Department } from "@entities/Department";


interface WeekInfo {
    total_wages: number | null;
    total_accrual: number | null;
    confirmed: boolean;
    week: string;
    year: string;
}

interface WeekData {
    [key: string]: WeekInfo;
}

interface TotalData {
    [key: string]: WeekInfo;
}

export interface WagesItem {
    id: number;
    current_balance: number;
    first_name: string;
    last_name: string;
    weeks_info: WeekData;
    description: string;
    departments: Department[] | undefined;
}

export type WagesList = {
    detailed_data: WagesItem[];
    total_data: TotalData;
}

export interface WagesEarnedPerDay {
    accruals: number;
    debit: number;
    confirmed: boolean;
}

export interface EarnedPerWeek {
    [key: string]: WagesEarnedPerDay;
}


// TODO сделать нормальные типы
export interface week_data {
    week: number | undefined;
    year: number | undefined;
}

export interface week_info extends week_data {
    str_dates: string[];
    dt_dates: string[];
    date_range: string[];
    previous_week_data: week_data | null;
    next_week_data: week_data | null;
    earned: string;
}

export interface WagesWeekInfo {
    target_week_info: week_info;
    earned_per_week: EarnedPerWeek;
}

export interface AssignmentsCounter {
    product_name: string;
    department_name: string;
    count: number;
    co_executor_count: number;
    amount_range: string;
    total_amount: number;
    thumbnail_urls: string[];
    picture_urls: string[];
}
