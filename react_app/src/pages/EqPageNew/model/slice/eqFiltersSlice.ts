import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {week_info} from "entities/WeekInfo/model/types/weekInfo";

import {EqFilters, ViewMode} from "../types/eqPageSchema";

const initialState: EqFilters = {
    weekData: {
        week: undefined,
        year: undefined,
        hasUpdated: false,
        isLoading: false,
        earned: 0,
    },
    projectFilter: {
        filters: ["Все проекты",],
        default: "Все проекты",
        currentFilter: "Все проекты",
        isLoading: false,
    },
    viewModeFilter: {
        filters: [
            {name: "Личные наряды", key: 0},
        ],
        default: {name: "Личные наряды", key: 0},
        currentFilter: {name: "Личные наряды", key: 0},
        isLoading: false,
    }
};

const eqFiltersSlice = createSlice({
    name: 'eqFilters',
    initialState,
    reducers: {
        setCurrentViewMode: (state, action: PayloadAction<ViewMode>) => {
            state.viewModeFilter.currentFilter = action.payload;
        },
        setViewModes: (state, action: PayloadAction<ViewMode[]>) => {
            state.viewModeFilter.filters = action.payload;
        },

        setCurrentProject: (state, action: PayloadAction<string>) => {
            state.projectFilter.currentFilter = action.payload;
        },
        setProjects: (state, action: PayloadAction<string[]>) => {
            state.projectFilter.filters = action.payload;
        },

        setWeekData: (state, action: PayloadAction<week_info>) => {
            state.weekData = {...state.weekData, ...action.payload};
        },
        weekDataHasUpdated: (state) => {
            state.weekData.hasUpdated = !state.weekData.hasUpdated;
        },

    },
    extraReducers: (builder) => {},
});


export const {actions: eqFiltersActions} = eqFiltersSlice;
export const {reducer: eqFiltersReducer} = eqFiltersSlice;
