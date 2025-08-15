import {create} from 'zustand';


interface ShowTotalState {
    showTotal: boolean;
    setShowTotal: (showCoins: boolean) => void;
}


export const useShowTotal = create<ShowTotalState>((set) => ({
    showTotal: localStorage.getItem('showTotal') === 'true',
    setShowTotal: (showTotal: boolean) => {
        localStorage.setItem('showTotal', showTotal.toString());
        set({showTotal})
    }
}));
