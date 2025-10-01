import {create} from 'zustand';


interface PlanSumState {
    planSum: number | null;
    setPlanSum: (planProject: number | null) => void;
}

export const usePlanSum = create<PlanSumState>((set) => ({
    planSum: 14_000_000,
    setPlanSum: (planSum: number | null) => {
        set({planSum})
    }
}));
