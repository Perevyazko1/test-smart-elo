import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
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

    setTargetDate(props: {
        target_date: string | null;
        series_id: string;
    }): Promise<AxiosResponse<{ success: boolean }>> {
        return $axios.post<{ success: boolean  }>(
            `/plan/set_target_date/`,
            props,
        );
    }
}

export const planService = new PlanService();
