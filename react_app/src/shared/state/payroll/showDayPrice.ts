import {create} from 'zustand';


interface ShowDayPriceState {
    showDayPrice: boolean;
    setShowDayPrice: (showCoins: boolean) => void;
}


export const useShowDayPrice = create<ShowDayPriceState>((set) => ({
    showDayPrice: localStorage.getItem('showDayPrice') === 'true',
    setShowDayPrice: (showDayPrice: boolean) => {
        localStorage.setItem('showDayPrice', showDayPrice.toString());
        set({showDayPrice})
    }
}));
