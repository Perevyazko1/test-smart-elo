import {create} from 'zustand';


interface ShowCoinsState {
    showCoins: boolean;
    setShowCoins: (showCoins: boolean) => void;
}


export const useShowCoins = create<ShowCoinsState>((set) => ({
    showCoins: localStorage.getItem('showCoins') === 'true',
    setShowCoins: (showCoins: boolean) => {
        localStorage.setItem('showCoins', showCoins.toString());
        set({showCoins})
    }
}));
