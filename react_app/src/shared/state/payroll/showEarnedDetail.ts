import {create} from 'zustand';


interface ShowEarnedDetailState {
    showEarnedDetail: boolean;
    setShowEarnedDetail: (showEarnedDetail: boolean) => void;
}


export const useShowEarnedDetail = create<ShowEarnedDetailState>((set) => ({
    showEarnedDetail: localStorage.getItem('showEarnedDetail') === 'true',
    setShowEarnedDetail: (showEarnedDetail: boolean) => {
        localStorage.setItem('showEarnedDetail', showEarnedDetail.toString());
        set({showEarnedDetail})
    }
}));
