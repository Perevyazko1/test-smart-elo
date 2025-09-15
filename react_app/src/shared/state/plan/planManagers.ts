import {create} from 'zustand';


interface PlanManagerState {
    planManager: number | null;
    setPlanManager: (manager_id: number | null) => void;
}

export const usePlanManager = create<PlanManagerState>((set) => ({
    planManager: Number(localStorage.getItem('planManager')) || null,
    setPlanManager: (planManager: number | null) => {
        localStorage.setItem('planManager', String(planManager));
        set({planManager})
    }
}));
