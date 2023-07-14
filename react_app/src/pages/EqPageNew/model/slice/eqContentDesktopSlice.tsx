import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {eqPageCardEntityAdapter} from "entities/EqPageCard";

import {EqContentDesktop} from "../types/eqPageSchema";
import {fetchListData} from "../service/fetchListData";
import {fetchEqUpdateCard} from "../service/fetchEqUpdateCard";

const initialState: EqContentDesktop = {
    awaitList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
    inWorkList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
    readyList: {
        results: {
            ids: [],
            entities: {},
        },
        count: 0,
        isLoading: true,
        hasUpdated: false,
        next: null,
        previous: null,
    },
}


const eqContentDesktopSlice = createSlice({
    name: 'eqContentDesktopSlice',
    initialState,
    reducers: {
        awaitListHasUpdated: (state) => {
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated;
        },
        inWorkListHasUpdated: (state) => {
            state.inWorkList.hasUpdated = !state.inWorkList.hasUpdated;
        },
        readyListHasUpdated: (state) => {
            state.readyList.hasUpdated = !state.readyList.hasUpdated;
        },

        allListUpdated: (state) => {
            state.readyList.hasUpdated = !state.readyList.hasUpdated;
            state.inWorkList.hasUpdated = !state.inWorkList.hasUpdated;
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated;
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
                        if (action.meta.arg.url) {
                            eqPageCardEntityAdapter.addMany(state.awaitList.results, results)
                        } else {
                            eqPageCardEntityAdapter.setAll(state.awaitList.results, results)
                        }
                        state.awaitList = {...state.awaitList, ...props}
                        state.awaitList.isLoading = false;
                        return;
                    case "in_work":
                        if (action.meta.arg.url) {
                            eqPageCardEntityAdapter.addMany(state.inWorkList.results, results)
                        } else {
                            eqPageCardEntityAdapter.setAll(state.inWorkList.results, results)
                        }
                        state.inWorkList = {...state.inWorkList, ...props}
                        state.inWorkList.isLoading = false;
                        return;
                    case "ready":
                        if (action.meta.arg.url) {
                            eqPageCardEntityAdapter.addMany(state.readyList.results, results)
                        } else {
                            eqPageCardEntityAdapter.setAll(state.readyList.results, results)
                        }
                        state.readyList = {...state.readyList, ...props}
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
            .addCase(fetchEqUpdateCard.fulfilled, (state, action) => {
                if (action.payload.await.assignments.length === 0 && action.payload.await.card_info.count_in_work === 0) {
                    eqPageCardEntityAdapter.removeOne(state.awaitList.results, action.payload.await.series_id)
                } else {
                    eqPageCardEntityAdapter.upsertOne(state.awaitList.results, action.payload.await)
                }

                if (action.payload.in_work.assignments.length === 0) {
                    eqPageCardEntityAdapter.removeOne(state.inWorkList.results, action.payload.in_work.series_id)
                } else {
                    eqPageCardEntityAdapter.upsertOne(state.inWorkList.results, action.payload.in_work)
                }
                if (action.payload.ready.assignments.length === 0) {
                    eqPageCardEntityAdapter.removeOne(state.readyList.results, action.payload.ready.series_id)
                } else {
                    eqPageCardEntityAdapter.upsertOne(state.readyList.results, action.payload.ready)
                }
            })
    }
});

export const {reducer: eqContentDesktopReducer} = eqContentDesktopSlice;
export const {actions: eqContentDesktopActions} = eqContentDesktopSlice;
