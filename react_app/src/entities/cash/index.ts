import type {IEarning} from "@/entities/salary";

export interface ICashInfo {
    cash_balance: number;
    date_from: string;
    date_to: string;
    card_balance: number;
    start_balance: number;
    end_balance: number;
    earnings: IEarning[];
}