import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {week_info} from "entities/WeekInfo";

import {EqSchema, ViewMode} from "../types/eqSchema";
import {fetchWeekInfo} from "../service/fetchWeekInfo/fetchWeekInfo";
import {EQ_WEEK_YEAR_INFO} from "shared/const/localstorage";


export const initialState: EqSchema = {
    series_size: 1,
    current_view_mode: {name: "Личные наряды", key: 0},
    current_project: "Все проекты",

    week_info_updated: false,
    week_info_is_loading: true,
}


export const eqSlice = createSlice({
        name: 'eq',
        initialState,
        reducers: {
            setViewMods: (state, action: PayloadAction<ViewMode[]>) => {
                state.view_modes = action.payload
            },
            setCurrentViewMode: (state, action: PayloadAction<ViewMode>) => {
                state.current_view_mode = action.payload
            },

            setProjectFilters: (state, action: PayloadAction<string[]>) => {
                state.project_filters = action.payload
            },
            setCurrentProject: (state, action: PayloadAction<string>) => {
                state.current_project = action.payload
            },


            setSeriesSize: (state, action: PayloadAction<number>) => {
                state.series_size = action.payload
            },

            setDefaultFilters: (state) => {
                state.current_view_mode = initialState.current_view_mode;
                state.current_project = initialState.current_project;
                state.series_size = initialState.series_size;
            },

            initWeekInfo: (state) => {
                console.log('Init week info')
            },

            weekInfoUpdated: (state) => {
                state.week_info_updated = !state.week_info_updated
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchWeekInfo.pending, (state) => {
                    state.week_info_is_loading = true;
                    // state.error = undefined;
                })
                .addCase(fetchWeekInfo.fulfilled, (state, action: PayloadAction<week_info>) => {
                    state.week_info_is_loading = false;
                    state.week_info = action.payload;
                    localStorage.setItem(EQ_WEEK_YEAR_INFO, JSON.stringify({
                        ...action.payload,
                        date: Date.now()
                    }))

                })
                .addCase(fetchWeekInfo.rejected, (state) => {
                    state.week_info_is_loading = false;
                    // state.error = action.payload;
                })
        }
    }
)

export const {actions: eqActions} = eqSlice;
export const {reducer: eqReducer} = eqSlice;

