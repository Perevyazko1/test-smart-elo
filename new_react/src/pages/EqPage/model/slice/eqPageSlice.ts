import {EqPageSchema} from "@pages/EqPage";
import {createSlice} from "@reduxjs/toolkit";

import {InitialEqBodySchema} from "../types/eqPageSchema";
import {fetchEqFilters} from "../api/fetchEqFilters";
import {fetchWeekData} from "../api/fetchWeekData";
import {fetchListData} from "../api/fetchListData";
import {eqCardEntityAdapter} from "../types/eqCard";

const initialState: EqPageSchema = InitialEqBodySchema;

const eqPageSlice = createSlice({
    name: 'eqPageSlice',
    initialState,
    reducers: {
        awaitUpdated: (state) => {
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated;
        },
        inWorkUpdated: (state) => {
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
            // Запрос фильтров
            .addCase(fetchEqFilters.pending, (state) => {
                state.projects.isLoading = true;

                state.viewModes.isLoading = true;
            })
            .addCase(fetchEqFilters.fulfilled, (state, action) => {
                state.projects.filters = action.payload.project_filters;
                state.projects.isLoading = false;

                state.viewModes.filters = action.payload.view_modes;
                state.viewModes.isLoading = false;
            })
            .addCase(fetchEqFilters.rejected, (state) => {
                state.projects.isLoading = false;
                state.viewModes.isLoading = false;
            })


            // Запрос инфо по неделям
            .addCase(fetchWeekData.pending, (state) => {
                state.weekData.isLoading = true;
            })

            .addCase(fetchWeekData.fulfilled, (state, action) => {
                state.weekData = {...state.weekData, ...action.payload};
                state.weekData.isLoading = false;
            })

            .addCase(fetchWeekData.rejected, (state) => {
                state.weekData.isLoading = false;
            })

            // Запрос списков
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
                        if (action.meta.arg.offset !== 0) {
                            eqCardEntityAdapter.addMany(state.awaitList.results, results)
                        } else {
                            eqCardEntityAdapter.setAll(state.awaitList.results, results)
                        }
                        state.awaitList = {...state.awaitList, ...props}
                        state.awaitList.isLoading = false;
                        return;
                    case "in_work":
                        if (action.meta.arg.offset !== 0) {
                            eqCardEntityAdapter.addMany(state.inWorkList.results, results)
                        } else {
                            eqCardEntityAdapter.setAll(state.inWorkList.results, results)
                        }
                        state.inWorkList = {...state.inWorkList, ...props}
                        state.inWorkList.isLoading = false;
                        return;
                    case "ready":
                        if (action.meta.arg.offset !== 0) {
                            eqCardEntityAdapter.addMany(state.readyList.results, results)
                        } else {
                            eqCardEntityAdapter.setAll(state.readyList.results, results)
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
    }
});

export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;