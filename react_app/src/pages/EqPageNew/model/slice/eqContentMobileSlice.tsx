import {EqContentMobile} from "../types/eqPageSchema";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: EqContentMobile = {
    cardList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: false,
        hasUpdated: false,
        notRelevantId: [],
        next: null,
        previous: null,
    },
}


const eqContentMobileSlice = createSlice({
    name: 'eqContentMobileSlice',
    initialState,
    reducers: {
        addNotRelevantId: (state, action: PayloadAction<number>) => {
            state.cardList.notRelevantId = [...state.cardList.notRelevantId, action.payload]
        },
        awaitListHasUpdated: (state) => {
            state.cardList.hasUpdated = !state.cardList.hasUpdated
        },
    },
    extraReducers: (builder) => {

    },
});

export const {reducer: eqContentMobileReducer} = eqContentMobileSlice;
export const {actions: eqContentMobileActions} = eqContentMobileSlice;
