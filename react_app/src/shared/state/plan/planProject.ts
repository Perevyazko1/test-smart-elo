import {create} from 'zustand';


interface PlanProjectState {
    planProject: string | null;
    setPlanProject: (planProject: string | null) => void;
}

export const usePlanProject = create<PlanProjectState>((set) => ({
    planProject: localStorage.getItem('planProject') || null,
    setPlanProject: (planProject: string | null) => {
        localStorage.setItem('planProject', String(planProject));
        set({planProject})
    }
}));
