import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/plan/planProject.ts";
import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {usePlanManager} from "@/shared/state/plan/planManagers.ts";
import type {IUser} from "@/entities/user";
import {usePlanAgent} from "@/shared/state/plan/planAgent.ts";
import type {IAgentTag} from "@/entities/plan";
import {usePlanSum} from "@/shared/state/plan/planSum.ts";
import {Input } from "@/components/ui/input"
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {useEffect, useState} from "react";

interface IProps {

}


export function PlanNav(props: IProps) {
    const {} = props;

    const planProject = usePlanProject(s => s.planProject);
    const setPlanProject = usePlanProject(s => s.setPlanProject);

    const planManager = usePlanManager(s => s.planManager);
    const setPlanManager = usePlanManager(s => s.setPlanManager);

    const planAgent = usePlanAgent(s => s.planAgent);
    const setPlanAgent = usePlanAgent(s => s.setPlanAgent);


    const planSum = usePlanSum(s => s.planSum);
    const setPlanSum = usePlanSum(s => s.setPlanSum);

    const [inputValue, setInputValue] = useState<number>()

    const dUpdateSum = useDebounce(
        (data: number) => setPlanSum(data),
        2000
    );

    useEffect(() => {
        dUpdateSum(inputValue);
    }, [inputValue]);

    const {data: projects} = useQuery({
        queryKey: ['planProjects'],
        queryFn: planService.getProjects,
    });

    const {data: managers} = useQuery({
        queryKey: ['planManagers'],
        queryFn: planService.getManagers,
    });

    const {data: agents} = useQuery({
        queryKey: ['planAgents'],
        queryFn: planService.getAgents,
    });

    const projectList = projects?.data?.result.map((project) => (project === "" ? "Без проекта" : project));
    const managerList = managers?.data?.result;
    const agentList = agents?.data?.result;

    const getManager = () => {
        return managers?.data.result?.find((manager) => manager.id === planManager);
    }

    const setManager = (manager: IUser | undefined | null) => {
        setPlanManager(manager?.id || null)
    }

    const getAgent = () => {
        return agents?.data.result?.find((agent) => agent.id === planAgent);
    }
    const setAgent = (agent: IAgentTag | undefined | null) => {
        setPlanAgent(agent?.id || null)
    }

    return (
        <div className={'flex gap-1'}>
            <Dropdown<string>
                selectedItem={planProject}
                items={projectList || []}
                setSelectedItem={(item) => setPlanProject(item || null)}
                getItemLabel={(item) => item || "Проект..."}
            />

            <Dropdown<IUser>
                selectedItem={getManager()}
                items={managerList || []}
                setSelectedItem={setManager}
                getItemLabel={(user) => (user ? `${user.first_name} ${user.last_name}` : "Менеджер...")}
            />

            <Dropdown<IAgentTag>
                selectedItem={getAgent()}
                items={agentList || []}
                setSelectedItem={setAgent}
                getItemLabel={(item) => item?.name || "Заказчик..."}
            />

            <div>
            <Input
                className={'px-2'}
                type={'number'}
                onChange={(e) => setInputValue(Number(e.target.value))}
                value={String(inputValue)}
            />
            </div>
        </div>
    );
}