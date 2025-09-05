import {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {twMerge} from "tailwind-merge";
import {useQuery} from "@tanstack/react-query";
import {planService} from "@/widgets/plan/model/api.ts";
import {usePlanProject} from "@/shared/state/payroll/planProject.ts";

interface IProps {

}


export function PlanNav(props: IProps) {
    const {} = props;
    const [open, setOpen] = useState(false);

    const planProject = usePlanProject(s => s.planProject);
    const setPlanProject = usePlanProject(s => s.setPlanProject);

    const {data, isFetching} = useQuery({
        queryKey: ['planProjects'],
        queryFn: planService.getProjects,
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Btn
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between flex bg-black text-white gap-4"
                >
                    {planProject
                        ? data?.data?.data.find((project) => project === planProject)
                        : "Проект..."}
                    <ChevronsUpDown className="opacity-50"/>
                </Btn>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Поиск..." className="h-9"/>
                    <CommandList>
                        <CommandEmpty>Проект не найден</CommandEmpty>
                        <CommandGroup>
                            {data?.data.data.map((project) => (
                                <CommandItem
                                    key={project}
                                    value={project}
                                    onSelect={(currentValue) => {
                                        setPlanProject(currentValue === planProject ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {project}
                                    <Check
                                        className={twMerge(
                                            "ml-auto",
                                            planProject === project ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}