import {department} from "entities/Department";
import {week_info} from "entities/WeekInfo";


interface WeekInfo {
    total: number | null;
    confirmed: boolean;
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
}

export interface EarnedPerWeek {
    [key: string]: WagesEarnedPerDay;
}

export interface WagesWeekInfo {
    target_week_info: week_info;
    earned_per_week: EarnedPerWeek;
}
