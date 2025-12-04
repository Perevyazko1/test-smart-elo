import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
import type {IAgentTag, IPlanData} from "@/entities/plan";
import type {IUser} from "@/entities/user";

class PlanService {
    getPlanTable(props: {
        project: string | null;
        manager_id: number | null;
        agent_id: number | null;
    }): Promise<AxiosResponse<IPlanData | null>> {
        return $axios.get<IPlanData | null>(
            `/plan/plan_table/`,
            {
                params: props
            }
        );
    }

    getProjects(props: {}): Promise<AxiosResponse<{ result: string[] }>> {
        return $axios.get<{ result: string[] }>(
            `/plan/get_projects/`,
        );
    }

    getManagers(props: {}): Promise<AxiosResponse<{ result: IUser[] }>> {
        return $axios.get<{ result: IUser[] }>(
            `/plan/get_managers/`,
        );
    }

    getAgents(props: {}): Promise<AxiosResponse<{ result: IAgentTag[] }>> {
        return $axios.get<{ result: IAgentTag[] }>(
            `/plan/get_agents/`,
        );
    }
}

export const planService = new PlanService();
