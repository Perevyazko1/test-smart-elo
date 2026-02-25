import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TPlanSortMode = 'default' | 'project' | 'project_min_date';

interface IPlanSortState {
    sortMode: TPlanSortMode;
    setSortMode: (mode: TPlanSortMode) => void;
}

export const usePlanSort = create<IPlanSortState>()(
    persist(
        (set) => ({
            sortMode: 'default',
            setSortMode: (mode) => set({ sortMode: mode }),
        }),
        {
            name: 'plan-sort-storage',
        }
    )
);
