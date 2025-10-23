import {create} from 'zustand';


interface ShowDayPriceState {
    showDayPrice: boolean;
    setShowDayPrice: (showCoins: boolean) => void;
}


export const useShowDayPrice = create<ShowDayPriceState>((set) => ({
    showDayPrice: typeof window !== 'undefined' ? localStorage.getItem('showDayPrice') === 'true' : false,
    setShowDayPrice: (showDayPrice: boolean) => {
        localStorage.setItem('showDayPrice', showDayPrice.toString());
        set({showDayPrice})
    }
}));
