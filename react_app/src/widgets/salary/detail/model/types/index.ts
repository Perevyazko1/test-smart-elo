import type {IEarning} from "@/entities/salary";

export interface ISalaryDetailUserInfo {
    name: string;
    id: number;
    balance: number;
}

export interface ISalaryDetail {
    user_info: ISalaryDetailUserInfo;
    detail_report: IEarning[] | null;
    week_report: IEarning[] | null;
}