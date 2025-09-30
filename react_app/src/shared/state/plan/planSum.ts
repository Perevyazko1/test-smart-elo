import {create} from 'zustand';


interface PlanSumState {
    planSum: number | null;
    setPlanSum: (planProject: number | null) => void;
}

export const usePlanSum = create<PlanSumState>((set) => ({
    planSum: null,
    setPlanSum: (planSum: number | null) => {
        set({planSum})
    }
}));
