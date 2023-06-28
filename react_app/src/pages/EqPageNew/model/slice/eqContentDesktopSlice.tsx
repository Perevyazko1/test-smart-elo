import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {eqPageCardEntityAdapter} from "entities/EqPageCard";

import {EqContentDesktop} from "../types/eqPageSchema";
import {fetchListData} from "../service/apiDesktop/fetchListData";

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
        builder
            .addCase(fetchListData.pending, (state, action) => {
                switch (action.meta.arg.target_list) {
                    case "await":
                        state.awaitList.isLoading = true;
                        return;
                    case "in_work":
                        state.inWorkList.isLoading = true;
                        return;
                    case "ready":
                        state.readyList.isLoading = true;
                        return;
                }
            })
            .addCase(fetchListData.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                switch (action.meta.arg.target_list) {
                    case "await":
                        eqPageCardEntityAdapter.addMany(state.awaitList.results, results)
                        state.awaitList = {...state.awaitList, ...props}
                        state.awaitList.isLoading = false;
                        return;
                    case "in_work":
                        eqPageCardEntityAdapter.addMany(state.inWorkList.results, results)
                        state.inWorkList = {...state.awaitList, ...props}
                        state.inWorkList.isLoading = false;
                        return;
                    case "ready":
                        eqPageCardEntityAdapter.addMany(state.readyList.results, results)
                        state.readyList = {...state.awaitList, ...props}
                        state.readyList.isLoading = false;
                        return;
                }
            })
            .addCase(fetchListData.rejected, (state, action) => {
                switch (action.meta.arg.target_list) {
                    case "await":
                        state.awaitList.isLoading = false;
                        return;
                    case "in_work":
                        state.inWorkList.isLoading = false;
                        return;
                    case "ready":
                        state.readyList.isLoading = false;
                        return;
                }
            })
    }
});

export const {reducer: eqContentDesktopReducer} = eqContentDesktopSlice;
export const {actions: eqContentDesktopActions} = eqContentDesktopSlice;
