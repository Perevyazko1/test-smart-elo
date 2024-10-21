import {DateRangeData} from "@pages/TaskPage";


export interface RangeData extends DateRangeData {
    accrual: number;
    debit: number;
    pre_accrual: number;
    pre_debit: number;
    no_confirmed: boolean;
}


export interface StaffInfoRange {
    I: RangeData;
    II: RangeData;
    III: RangeData;
    VI: RangeData;
}


export interface StaffInfo {
    id: number;
    user_total_info: StaffInfoRange;
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
