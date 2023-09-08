import {department} from "entities/Department";
import {week_info} from "entities/WeekInfo";


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
    departments: department[] | undefined;
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

export interface WagesWeekInfo {
    target_week_info: week_info;
    earned_per_week: EarnedPerWeek;
}

export interface AssignmentsCounter {
    product_name: string;
    department_name: string;
    count: number;
    thumbnail_urls: string[];
    picture_urls: string[];
}
