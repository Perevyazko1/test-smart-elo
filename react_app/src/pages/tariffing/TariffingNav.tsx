import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {create} from 'zustand';
import {useQuery} from "@tanstack/react-query";
import {$axios} from "@/shared/api";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {Toggle} from "@/components/ui/toggle.tsx";
import React, {useState} from "react";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {twMerge} from "tailwind-merge";


interface Props {

}


interface ProjectState {
    project: string | null;
    setProject: (project: string | null) => void;
    product: string;
    setProduct: (project: string) => void;
    showAll: boolean;
    setShowAll: (showAll: boolean) => void;
    unconfirmed: boolean;
    setUnconfirmed: (unconfirmed: boolean) => void;
}

export const useProject = create<ProjectState>((set) => ({
    project: localStorage.getItem('project'),
    setProject: (project: string | null) => {
        if (!project) {
            localStorage.removeItem('project');
        } else {
            localStorage.setItem('project', String(project));
        }
        set({project})
    },

    unconfirmed: localStorage.getItem('unconfirmed') === 'true',
    setUnconfirmed: (unconfirmed: boolean) => {
        localStorage.setItem('unconfirmed', String(unconfirmed));
        set({unconfirmed})
    },
    product: localStorage.getItem('product') || "",
    setProduct: (product: string) => {
        localStorage.setItem('product', String(product));
        set({product})
    },

    showAll: localStorage.getItem('showAll') === 'true',
    setShowAll: (showAll: boolean) => {
        localStorage.setItem('showAll', String(showAll));
        set({showAll})
    },
}));


export const TariffingNav = (props: Props) => {
    const {} = props;

    const project = useProject(s => s.project);
    const product = useProject(s => s.product);
    const unconfirmed = useProject(s => s.unconfirmed);
    const showAll = useProject(s => s.showAll);

    const [inputValue, setInputValue] = useState(product);


    const setUnconfirmed = useProject(s => s.setUnconfirmed);
    const setProject = useProject(s => s.setProject);
    const setProduct = useProject(s => s.setProduct);
    const setShowAll = useProject(s => s.setShowAll);

    const setDebouncedProduct = useDebounce(setProduct, 500);

    const {data: projects} = useQuery({
        queryKey: ['projects'],
        queryFn: () => $axios.get<{ result: string[] }>(
            `/tariffs/get_projects/`,
        ),
    });

    const projectList = projects?.data?.result.map((project) => (project === "" ? "Без проекта" : project));

    const showAllActive = showAll && !(!product && !project)

    return (
        <div className={'flex flex-row justify-between items-center gap-2 flex-1'}>
            <div className={'flex items-center gap-3'}>
                <Dropdown<string>
                    resetItem={"Все проекты"}
                    selectedItem={project || "Все проекты"}
                    items={projectList || []}
                    setSelectedItem={(item) => setProject(item || null)}
                    getItemLabel={(item) => item || "Проект..."}
                />

                <span className={'text-sm text-nowrap'}>Не подтв: </span>
                <Toggle
                    className={twMerge(
                        unconfirmed ? 'bg-gray-200' : 'bg-gray-800',
                        'cursor-pointer noPrint'
                    )}
                    pressed={unconfirmed}
                    onPressedChange={() => setUnconfirmed(!unconfirmed)}
                >
                    {unconfirmed ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>

                <input
                    className={'bg-gray-100 text-black'}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setDebouncedProduct(e.target.value)
                    }}
                />

                <span className={'text-sm text-nowrap'}>ВСЕ: </span>
                <Toggle
                    className={twMerge(
                        showAllActive ? 'bg-gray-200' : 'bg-gray-800',
                        'cursor-pointer noPrint'
                    )}
                    pressed={showAll}
                    onPressedChange={() => setShowAll(!showAll)}
                    disabled={!product && !project}
                >
                    {showAllActive? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>
        </div>
    );
};
