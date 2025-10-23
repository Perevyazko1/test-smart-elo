import {create} from 'zustand';


interface ShowEarnedDetailState {
    showEarnedDetail: boolean;
    setShowEarnedDetail: (showEarnedDetail: boolean) => void;
}


export const useShowEarnedDetail = create<ShowEarnedDetailState>((set) => ({
    showEarnedDetail:
        typeof window !== 'undefined' ? localStorage.getItem('showEarnedDetail') === 'true' : false,
    setShowEarnedDetail: (showEarnedDetail: boolean) => {
        localStorage.setItem('showEarnedDetail', showEarnedDetail.toString());
        set({showEarnedDetail})
    }
}));
