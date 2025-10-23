import {create} from 'zustand';


interface ShowTotalState {
    showTotal: boolean;
    setShowTotal: (showCoins: boolean) => void;
}


export const useShowTotal = create<ShowTotalState>((set) => ({
    showTotal:
        typeof window !== 'undefined' ? localStorage.getItem('showTotal') === 'true' : false,
    setShowTotal: (showTotal: boolean) => {
        localStorage.setItem('showTotal', showTotal.toString());
        set({showTotal})
    }
}));
