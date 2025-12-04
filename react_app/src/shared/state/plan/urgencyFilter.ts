import {create} from 'zustand';


interface UrgencyFilterState {
    urgencyFilter: 1 | 2 | 3 | null;
    setUrgencyFilter: (urgencyFilter:  1 | 2 | 3 | null) => void;
}

export const useUrgencyFilter = create<UrgencyFilterState>((set) => ({
    urgencyFilter: null,
    setUrgencyFilter: (urgencyFilter:  1 | 2 | 3 | null) => {
        set({urgencyFilter})
    }
}));
