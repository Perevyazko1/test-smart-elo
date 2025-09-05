import {create} from 'zustand';


interface PlanProjectState {
    planProject: string;
    setPlanProject: (showCoins: string) => void;
}

export const usePlanProject = create<PlanProjectState>((set) => ({
    planProject: localStorage.getItem('planProject') || "",
    setPlanProject: (planProject: string) => {
        localStorage.setItem('planProject', planProject);
        set({planProject})
    }
}));
