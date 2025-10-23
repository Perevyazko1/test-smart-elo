import {create} from 'zustand';


interface ShowCoinsState {
    showCoins: boolean;
    setShowCoins: (showCoins: boolean) => void;
}


export const useShowCoins = create<ShowCoinsState>((set) => ({
    showCoins: typeof window !== 'undefined' ? localStorage.getItem('showCoins') === 'true' : false,
    setShowCoins: (showCoins: boolean) => {
        localStorage.setItem('showCoins', showCoins.toString());
        set({showCoins})
    }
}));
