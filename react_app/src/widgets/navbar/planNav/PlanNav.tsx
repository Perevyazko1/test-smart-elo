import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/plan/planProject.ts";
import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {usePlanManager} from "@/shared/state/plan/planManagers.ts";
import type {IUser} from "@/entities/user";

interface IProps {

}


export function PlanNav(props: IProps) {
    const {} = props;

    const planProject = usePlanProject(s => s.planProject);
    const setPlanProject = usePlanProject(s => s.setPlanProject);

    const planManager = usePlanManager(s => s.planManager);
    const setPlanManager = usePlanManager(s => s.setPlanManager);


    const {data: projects} = useQuery({
        queryKey: ['planProjects'],
        queryFn: planService.getProjects,
    });

    const {data: managers} = useQuery({
        queryKey: ['plaManagers'],
        queryFn: planService.getManagers,
    });

    const projectList = projects?.data?.result.map((project) => (project === "" ? "Без проекта" : project));
    const managerList = managers?.data?.result;

    const getManager = () => {
        return managers?.data.result?.find((manager) => manager.id === planManager);
    }

    const setManager = (manager: IUser | undefined | null) => {
        setPlanManager(manager?.id || null)
    }

    return (
        <>
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
        </>
    );
}