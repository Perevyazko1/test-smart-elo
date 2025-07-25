import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
import type {IPayroll, IPayrollRow} from "@/entities/salary";
import type {ICashInfo} from "@/entities/cash";

interface IGetCashInfoProps {
    date_from: string;
    date_to: string;
}


class CashService {
    getCashInfo(props: IGetCashInfoProps): Promise<AxiosResponse<ICashInfo>> {
        return $axios.get<ICashInfo>(
            `/salary/cash_info/`,
            {params: props}
        );
    }
}

export const cashService = new CashService();
