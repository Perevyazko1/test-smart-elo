import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
import type {IPayroll, IPayrollRow} from "@/entities/salary";
import type {PlanData} from "@/entities/plan";


class PlanService {
    getPlanTable(props: { project: string }): Promise<AxiosResponse<PlanData | null>> {
        return $axios.get<PlanData | null>(
            `/plan/plan_table/`,
            {
                params: props
            }
        );
    }

    getProjects(props: {}): Promise<AxiosResponse<{ data: string[] }>> {
        return $axios.get<{ data: string[] }>(
            `/core/get_project_filters/`,
        );
    }
}

export const planService = new PlanService();
