import {create} from 'zustand';


interface HideSumState {
    hideSum: boolean;
    setHideSum: (HideSum: boolean) => void;
}


export const useHideSum = create<HideSumState>((set) => ({
    hideSum:
        typeof window !== 'undefined' ? localStorage.getItem('hideSum') === 'true' : false,
    setHideSum: (hideSum: boolean) => {
        localStorage.setItem('hideSum', hideSum.toString());
        set({hideSum})
    }
}));
