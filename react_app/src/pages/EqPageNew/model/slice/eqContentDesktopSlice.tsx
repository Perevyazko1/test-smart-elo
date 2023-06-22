import {EqContentDesktop} from "../types/eqPageSchema";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: EqContentDesktop = {
    awaitList: {
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
    inWorkList: {
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
    readyList: {
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


const eqContentDesktopSlice = createSlice({
    name: 'eqContentDesktopSlice',
    initialState,
    reducers: {
        // await reducers
        addAwaitNotRelevantId: (state, action: PayloadAction<number>) => {
            state.awaitList.notRelevantId = [...state.awaitList.notRelevantId, action.payload]
        },
        awaitListHasUpdated: (state) => {
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated
        },


        // inWork reducers
        addInWorkNotRelevantId: (state, action: PayloadAction<number>) => {
            state.inWorkList.notRelevantId = [...state.inWorkList.notRelevantId, action.payload]
        },
        inWorkListHasUpdated: (state) => {
            state.inWorkList.hasUpdated = !state.inWorkList.hasUpdated
        },

        // ready reducers
        addReadyNotRelevantId: (state, action: PayloadAction<number>) => {
            state.readyList.notRelevantId = [...state.readyList.notRelevantId, action.payload]
        },
        readyListHasUpdated: (state) => {
            state.readyList.hasUpdated = !state.readyList.hasUpdated
        },


    },
    extraReducers: (builder) => {

    }
});

export const {reducer: eqContentDesktopReducer} = eqContentDesktopSlice;
export const {actions: eqContentDesktopActions} = eqContentDesktopSlice;
