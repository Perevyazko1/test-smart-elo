import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
import type {IPayroll, IPayrollRow} from "@/entities/salary";
import type {ISalaryDetail} from "@/widgets/salary/detail/model/types";

interface IGetInfoProps {
    date_from: string;
    date_to: string;
    user_id: number;
}


class SalaryDetailService {
    getUserInfo(props: IGetInfoProps): Promise<AxiosResponse<ISalaryDetail | null>> {
        return $axios.get<ISalaryDetail | null>(
            `/salary/user_info/`,
            {params: props}
        );
    }
}

export const salaryDetailService = new SalaryDetailService();
