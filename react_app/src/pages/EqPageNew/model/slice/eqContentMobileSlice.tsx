import {EqContentMobile} from "../types/eqPageSchema";
import {createSlice} from "@reduxjs/toolkit";

const initialState: EqContentMobile = {
    cardList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: false,
        hasUpdated: false,
        next: null,
        previous: null,
    },
}


const eqContentMobileSlice = createSlice({
    name: 'eqContentMobileSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.cardList.hasUpdated = !state.cardList.hasUpdated
        },
    },
    extraReducers: (builder) => {

    },
});

export const {reducer: eqContentMobileReducer} = eqContentMobileSlice;
export const {actions: eqContentMobileActions} = eqContentMobileSlice;
