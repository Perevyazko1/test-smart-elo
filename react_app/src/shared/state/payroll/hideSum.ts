import {create} from 'zustand';


interface HideSumState {
    hideSum: boolean;
    setHideSum: (HideSum: boolean) => void;
}


export const useHideSum = create<HideSumState>((set) => ({
    hideSum: localStorage.getItem('hideSum') === 'true',
    setHideSum: (hideSum: boolean) => {
        localStorage.setItem('hideSum', hideSum.toString());
        set({hideSum})
    }
}));
