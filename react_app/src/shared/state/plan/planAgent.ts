import {create} from 'zustand';

interface PlanAgentState {
    planAgent: number | null;
    setPlanAgent: (planAgent: number | null) => void;
}

export const usePlanAgent = create<PlanAgentState>((set) => ({
    planAgent: Number(localStorage.getItem('planAgent')) || null,
    setPlanAgent: (planAgent: number | null) => {
        localStorage.setItem('planAgent', String(planAgent));
        set({planAgent})
    }
}));