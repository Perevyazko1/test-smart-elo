import {rtkAPI} from "@shared/api";

interface IKpiData {
    date_from: string;
    date_to: string;
    total_count: number;
    total_sum: number;
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
