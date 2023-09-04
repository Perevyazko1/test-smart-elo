import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {EqFilters, ViewMode} from "../types/eqPageSchema";
import {fetchEqFilters} from "../service/fetchEqFilters";
import {fetchWeekData} from "../service/fetchWeekData";

export const initialState: EqFilters = {
    weekData: {
        str_dates: [],
        dt_dates: [],
        date_range: [],
        previous_week_data: null,
        next_week_data: null,
        week: undefined,
        year: undefined,
        hasUpdated: false,
        isLoading: true,
        earned: 0,
    },
    projectFilter: {
        filters: ["Все проекты",],
        default: "Все проекты",
        currentFilter: "Все проекты",
        isLoading: true,
    },
    viewModeFilter: {
        filters: [],
        default: {name: "Личные наряды", key: 0},
        currentFilter: {name: "Личные наряды", key: 0},
        isLoading: true,
    },
    seriesSize: 1,
    notRelevantId: [],
    listsHasUpdated: false,
};

const eqFiltersSlice = createSlice({
    name: 'eqFilters',
    initialState,
    reducers: {
        addNotRelevantId: (state, action: PayloadAction<string>) => {
            state.notRelevantId = [...state.notRelevantId, action.payload];
        },

        listsHasUpdated: (state) => {
            state.listsHasUpdated = !state.listsHasUpdated;
        },

        excludeNotRelevantId: (state, action: PayloadAction<string>) => {
            state.notRelevantId = state.notRelevantId.filter(
                        (series_id) => series_id !== action.payload)
        },

        setCurrentViewMode: (state, action: PayloadAction<ViewMode>) => {
            state.viewModeFilter.currentFilter = action.payload;
        },
        setCurrentProject: (state, action: PayloadAction<string>) => {
            state.projectFilter.currentFilter = action.payload;
        },
        setSeriesSize: (state, action: PayloadAction<number>) => {
            state.seriesSize = action.payload;
        },

        setDefaultViewMode: (state) => {
            state.viewModeFilter.currentFilter = initialState.viewModeFilter.default;
        },

        setWeekData: (state, action: PayloadAction<{ week: number | undefined, year: number | undefined }>) => {
            state.weekData = {...state.weekData, ...action.payload};
            state.weekData.hasUpdated = !state.weekData.hasUpdated;
        },
        weekDataHasUpdated: (state) => {
            state.weekData.hasUpdated = !state.weekData.hasUpdated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEqFilters.pending, (state) => {
                state.projectFilter.isLoading = true;

                state.viewModeFilter.isLoading = true;
            })

            .addCase(fetchEqFilters.fulfilled, (state, action) => {
                state.projectFilter.filters = action.payload.project_filters;
                state.projectFilter.isLoading = false;

                state.viewModeFilter.filters = action.payload.view_modes;
                state.viewModeFilter.isLoading = false;
            })

            .addCase(fetchEqFilters.rejected, (state) => {
                state.projectFilter.isLoading = false;
                state.viewModeFilter.isLoading = false;
            })

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
    },
});


export const {actions: eqFiltersActions} = eqFiltersSlice;
export const {reducer: eqFiltersReducer} = eqFiltersSlice;
