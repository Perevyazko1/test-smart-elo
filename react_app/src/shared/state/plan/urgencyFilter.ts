import {create} from 'zustand';


export type TUrgencyValue = 1 | 2 | 3;

interface UrgencyFilterState {
    urgencyFilter: TUrgencyValue[] | null;
    setUrgencyFilter: (urgencyFilter:  TUrgencyValue[] | null) => void;
}

export const useUrgencyFilter = create<UrgencyFilterState>((set) => ({
    urgencyFilter: null,
    setUrgencyFilter: (urgencyFilter: TUrgencyValue[] | null) => {
        set({urgencyFilter})
    }
}));
