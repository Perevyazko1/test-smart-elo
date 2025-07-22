import {EqPageSchema} from "@pages/EqPage";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {InitialEqBodySchema} from "../types/eqPageSchema";
import {fetchEqFilters} from "../api/fetchEqFilters";
import {fetchWeekData} from "../api/fetchWeekData";

const initialState: EqPageSchema = InitialEqBodySchema;

const eqPageSlice = createSlice({
    name: 'eqPageSlice',
    initialState,
    reducers: {
        viewModeInited: (state) => {
            state.viewModes.inited = true;
        },
        projectsInited: (state) => {
            state.projects.inited = true;
        },
        filtersInited: (state, action: PayloadAction<boolean>) => {
            state.filtersInited = action.payload;
        },
        filtersReady: (state, action: PayloadAction<boolean>) => {
            state.filtersReady = action.payload;
        },
        addNotRelevantId: (state, action: PayloadAction<number>) => {
            state.notRelevantIds = [...state.notRelevantIds, action.payload];
        },
        clearNotRelevantId: (state) => {
            state.notRelevantIds = []
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
    }
});

export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;