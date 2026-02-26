import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/plan/planProject.ts";
import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {usePlanManager} from "@/shared/state/plan/planManagers.ts";
import type {IUser} from "@/entities/user";
import {usePlanAgent} from "@/shared/state/plan/planAgent.ts";
import type {IAgentTag} from "@/entities/plan";
import {ShipmentWidget} from "@/widgets/shipment/ShipmentWidget.tsx";
import {type TUrgencyValue, useUrgencyFilter} from "@/shared/state/plan/urgencyFilter.ts";
import {usePlanSort} from "@/shared/state/plan/planSort.ts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import {CrossCircledIcon} from "@radix-ui/react-icons";
import {ButtonGroup} from "@/components/ui/button-group.tsx";

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

    const urgency = useUrgencyFilter(s => s.urgencyFilter);
    const setUrgencyFilter = useUrgencyFilter(s => s.setUrgencyFilter);

    const sortMode = usePlanSort(s => s.sortMode);
    const setSortMode = usePlanSort(s => s.setSortMode);

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

    const setUrgency = (value: TUrgencyValue | null) => {
        if (value === null) {
            setUrgencyFilter(value);
        } else {
            if (urgency?.includes(value)) {
                if (urgency?.length === 1) {
                    setUrgencyFilter(null);
                } else {
                    setUrgencyFilter(urgency.filter(i => i !== value));
                }
            } else {
                setUrgencyFilter(urgency ? [...urgency, value] : [value]);
            }
        }
    }

    return (
        <div className={'flex flex-row justify-between items-center gap-2 flex-1'}>
            <div className={'flex gap-1 text-[12px]'}>
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

                <div className={'w-full'}>
                    <ButtonGroup className="w-full grid grid-cols-3 text-sm">
                        <Btn
                            className={twMerge(
                                'm-0 px-1 border-1 border-black flex-1 bg-gray-400 text-[8px]',
                                sortMode === 'default' && 'bg-blue-300'
                            )}
                            onClick={() => setSortMode('default')}
                        >
                            ПО ДАТЕ
                        </Btn>
                        <Btn
                            className={twMerge(
                                'm-0 px-1 border-1 border-black flex-1 bg-gray-400 text-[8px]',
                                sortMode === 'project' && 'bg-blue-300'
                            )}
                            onClick={() => setSortMode('project')}
                        >
                            ПО ПРОЕКТУ
                        </Btn>
                        <Btn
                            className={twMerge(
                                'm-0 px-1 border-1 border-black flex-1 bg-gray-400 text-[8px]',
                                sortMode === 'project_min_date' && 'bg-blue-300'
                            )}
                            onClick={() => setSortMode('project_min_date')}
                        >
                            ПРОЕКТ (ДАТА)
                        </Btn>
                    </ButtonGroup>
                </div>

                <div className={'w-full'}>
                    <ButtonGroup className="w-full grid grid-cols-4">
                        <Btn
                            className={
                                twMerge(
                                    'text-red-700 m-0 p-1 border-1 font-bold border-black flex-1 bg-gray-400',
                                    urgency?.includes(1) && 'bg-red-300'
                                )
                            }
                            onClick={() => setUrgency(1)}
                        >
                            1
                        </Btn>
                        <Btn
                            className={
                                twMerge(
                                    'text-yellow-700 m-0 p-1 border-1  font-bold border-black flex-1 bg-gray-400',
                                    urgency?.includes(2) && 'bg-yellow-300'
                                )}
                            onClick={() => setUrgency(2)}
                        >
                            2
                        </Btn>
                        <Btn
                            className={
                                twMerge(
                                    'text-green-700 m-0 p-1 border-1 border-black flex-1 bg-gray-400',
                                    urgency?.includes(3) && 'bg-green-300'
                                )}
                            onClick={() => setUrgency(3)}
                        >
                            3
                        </Btn>
                        <Btn
                            className={'text-red-700 m-0 p-1 border-1 border-black flex-1 bg-gray-400'}
                            onClick={() => {
                                setUrgencyFilter(null);
                            }
                            }
                        >
                            <CrossCircledIcon/>
                        </Btn>
                    </ButtonGroup>
                </div>
            </div>

            <ShipmentWidget/>
        </div>
    );
}