import {rtkAPI} from "@shared/api";

export interface IUserReport {
    username: string;
    name: string;
    count: number;
    co_executor_count: number;
    assignments_price: number;
    assignments_amount: number;
    co_executors_amount: number;
    task_amount: number;
}

interface IKpiData {
    date_from: string;
    date_to: string;
    total_count: number;
    total_sum: number;
    total_amount: number;
    user_report: IUserReport[];
}

interface IKpiProps {
    date_from: string;
    date_to: string;
    department__id: string;
}


const KpiApi = rtkAPI.injectEndpoints({
            endpoints: (build) => ({
                getKpiData: build.query<IKpiData, IKpiProps>({
                    query: (props: IKpiProps) => ({
                        url: '/staff/kpi/get_kpi_data',
                        params: {...props},
                    }),
                }),
            }),
        }
    )
;

export const useKpiData = KpiApi.useLazyGetKpiDataQuery;
