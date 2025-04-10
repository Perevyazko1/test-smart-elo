import {rtkAPI} from "@shared/api";

export interface IUserReport {
    username: string;
    name: string;
    count: number;
    co_executor_count: number;
    assignments_price: number;
}

interface IKpiData {
    date_from: string;
    date_to: string;
    total_count: number;
    total_sum: number;
    user_report: IUserReport[];
}

interface IKpiProps {
    date_from: string;
    date_to: string;
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
