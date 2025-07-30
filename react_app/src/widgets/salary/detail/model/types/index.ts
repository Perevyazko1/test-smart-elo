import type {IEarning} from "@/entities/salary";
import type {IUser} from "@/entities/user";

export interface ISalaryDetailUserInfo {
    user: IUser;
    balance: number;
}

export interface ISalaryDetail {
    user_info: ISalaryDetailUserInfo;
    detail_report: IEarning[] | null;
    week_report: IEarning[] | null;
}