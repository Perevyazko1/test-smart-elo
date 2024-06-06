import {EqPageSchema} from "@pages/EqPage";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {InitialEqBodySchema} from "../types/eqPageSchema";
import {fetchEqFilters} from "../api/fetchEqFilters";
import {fetchWeekData} from "../api/fetchWeekData";
import {fetchListData} from "../api/fetchListData";
import {fetchEqUpdCard} from "@pages/EqPage/model/api/fetchEqUpdCard";
import {eqCardEntityAdapter} from "@pages/EqPage/model/types";

const initialState: EqPageSchema = InitialEqBodySchema;

const eqPageSlice = createSlice({
    name: 'eqPageSlice',
    initialState,
    reducers: {
        filtersInited: (state, action: PayloadAction<boolean>) => {
            state.filtersInited = action.payload;
        },
        filtersReady: (state, action: PayloadAction<boolean>) => {
            state.filtersReady = action.payload;
        },
        awaitUpdated: (state) => {
            state.awaitList = {
                ...InitialEqBodySchema.awaitList,
                hasUpdated: !state.awaitList.hasUpdated,
            };
        },
        inWorkUpdated: (state) => {
            state.inWorkList = {
                ...InitialEqBodySchema.inWorkList,
                hasUpdated: !state.inWorkList.hasUpdated,
            };
        },
        readyUpdated: (state) => {
            state.readyList = {
                ...InitialEqBodySchema.readyList,
                hasUpdated: !state.readyList.hasUpdated,
            };
        },

        allListClear: (state) => {

            state.readyList = {
                ...InitialEqBodySchema.readyList,
                hasUpdated: state.readyList.hasUpdated,
            };
            state.inWorkList = {
                ...InitialEqBodySchema.inWorkList,
                hasUpdated: state.inWorkList.hasUpdated,
            };
            state.awaitList = {
                ...InitialEqBodySchema.awaitList,
                hasUpdated: state.awaitList.hasUpdated,
            };
        },

        addNotRelevantId: (state, action: PayloadAction<string>) => {
            state.notRelevantId = [...state.notRelevantId, action.payload];
        },
        excludeNotRelevantId: (state, action: PayloadAction<string>) => {
            state.notRelevantId = state.notRelevantId.filter(
                (series_id) => series_id !== action.payload)
        },
        weekDataHasUpdated: (state) => {
            state.weekData.hasUpdated = !state.weekData.hasUpdated;
        },

    },
    extraReducers: (builder) => {
        builder
            // Запрос фильтров
            .addCase(fetchEqFilters.pending, (state) => {
                state.filtersInited = false;
                state.filtersReady = false;
                state.projects.isLoading = true;
                state.viewModes.isLoading = true;
            })
            .addCase(fetchEqFilters.fulfilled, (state, action) => {
                state.projects.filters = action.payload.project_filters;
                state.projects.isLoading = false;

                state.viewModes.filters = action.payload.view_modes;
                state.viewModes.isLoading = false;
                state.filtersInited = true;
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
                state.weekData.inited = true;
            })

            .addCase(fetchWeekData.rejected, (state) => {
                state.weekData.isLoading = false;
                state.weekData.inited = true;
            })

            // Запрос списков
            .addCase(fetchListData.pending, (state, action) => {
                switch (action.meta.arg.target_list) {
                    case "await":
                        state.awaitList.isLoading = true;
                        state.awaitList.reqId = action.meta.arg.reqId;
                        return;
                    case "in_work":
                        state.inWorkList.isLoading = true;
                        state.inWorkList.reqId = action.meta.arg.reqId;
                        return;
                    case "ready":
                        state.readyList.isLoading = true;
                        state.readyList.reqId = action.meta.arg.reqId;
                        return;
                }
            })
            .addCase(fetchListData.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                switch (action.meta.arg.target_list) {
                    case "await":
                        if (action.meta.arg.reqId === state.awaitList.reqId) {
                            if (action.meta.arg.offset !== 0) {
                                eqCardEntityAdapter.addMany(state.awaitList.results, results);
                            } else {
                                eqCardEntityAdapter.setAll(state.awaitList.results, results);
                            }
                            state.awaitList = {...state.awaitList, ...props}
                            state.awaitList.isLoading = false;
                        }
                        return;
                    case "in_work":
                        if (action.meta.arg.reqId === state.inWorkList.reqId) {
                            if (action.meta.arg.offset !== 0) {
                                eqCardEntityAdapter.addMany(state.inWorkList.results, results)
                            } else {
                                eqCardEntityAdapter.setAll(state.inWorkList.results, results)
                            }
                            state.inWorkList = {...state.inWorkList, ...props}
                            state.inWorkList.isLoading = false;
                        }
                        return;
                    case "ready":
                        if (action.meta.arg.reqId === state.readyList.reqId) {
                            if (action.meta.arg.offset !== 0) {
                                eqCardEntityAdapter.addMany(state.readyList.results, results)
                            } else {
                                eqCardEntityAdapter.setAll(state.readyList.results, results)
                            }
                            state.readyList = {...state.readyList, ...props}
                            state.readyList.isLoading = false;
                        }
                        return;
                }
            })
            .addCase(fetchListData.rejected, (state, action) => {
                switch (action.meta.arg.target_list) {
                    case "await":
                        if (action.meta.arg.reqId === state.awaitList.reqId) {
                            state.awaitList.isLoading = false;
                        }
                        return;
                    case "in_work":
                        if (action.meta.arg.reqId === state.inWorkList.reqId) {
                            state.inWorkList.isLoading = false;
                        }
                        return;
                    case "ready":
                        if (action.meta.arg.reqId === state.readyList.reqId) {
                            state.readyList.isLoading = false;
                        }
                        return;
                }
            })

            .addCase(fetchEqUpdCard.fulfilled, (state, action) => {
                if (action.payload.await.assignments.length === 0 && action.payload.await.card_info.count_in_work === 0) {
                    eqCardEntityAdapter.removeOne(state.awaitList.results, action.payload.await.series_id)
                } else {
                    eqCardEntityAdapter.upsertOne(state.awaitList.results, action.payload.await)
                }

                if (action.payload.in_work.assignments.length === 0) {
                    eqCardEntityAdapter.removeOne(state.inWorkList.results, action.payload.in_work.series_id)
                } else {
                    eqCardEntityAdapter.upsertOne(state.inWorkList.results, action.payload.in_work)
                }

                if (action.payload.ready.assignments.length === 0) {
                    eqCardEntityAdapter.removeOne(state.readyList.results, action.payload.ready.series_id)
                } else {
                    eqCardEntityAdapter.upsertOne(state.readyList.results, action.payload.ready)
                }
            })
    }
});

export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;