import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {order_product, order_product_list} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";

import {EqSchema, ViewMode} from "../types/eqSchema";
import {fetchInWorkList} from "../service/fetchInWorkList/fetchInWorkList";
import {fetchReadyList} from "../service/fetchReadyList/fetchReadyList";
import {fetchWeekInfo} from "../service/fetchWeekInfo/fetchWeekInfo";


export const initialState: EqSchema = {
    series_size: 1,
    current_view_mode: {name: "Личные наряды", key: 0},
    current_project: "Все проекты",

    await_updated: 0,
    in_work_data: {has_updated: false, is_loading: true},
    ready_data: {has_updated: false, is_loading: true},

    week_info_updated: false,
    week_info_is_loading: false,
}


export const eqSlice = createSlice({
        name: 'eq',
        initialState,
        reducers: {
            awaitListUpdated: (state) => {
                state.await_updated = Date.now()
            },

            setInWorkList: (state, action: PayloadAction<order_product_list>) => {
                state.in_work_data.data = action.payload
            },
            inWorkListUpdated: (state) => {
                state.in_work_data.has_updated = !state.in_work_data.has_updated
            },

            setReadyList: (state, action: PayloadAction<order_product_list>) => {
                state.ready_data.data = action.payload
            },
            readyListUpdated: (state) => {
                state.ready_data.has_updated = !state.ready_data.has_updated
            },

            setWeekInfo: (state, action: PayloadAction<week_info>) => {
                state.week_info = action.payload
            },

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

            showCardInfo: (state, action: PayloadAction<order_product>) => {
                state.show_card_info = action.payload
            },

            clearCardInfo: (state) => {
                state.show_card_info = undefined
            },


            weekInfoUpdated: (state) => {
                state.week_info_updated = !state.week_info_updated
            },

            eqUpdated: (state) => {
                state.await_updated = Date.now()
                state.in_work_data.has_updated = !state.in_work_data.has_updated
                state.ready_data.has_updated = !state.ready_data.has_updated
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchInWorkList.pending, (state) => {
                    state.in_work_data.is_loading = true;
                    // state.error = undefined;
                })
                .addCase(fetchInWorkList.fulfilled, (state) => {
                    state.in_work_data.is_loading = false;
                })
                .addCase(fetchInWorkList.rejected, (state, action) => {
                    state.in_work_data.is_loading = false;
                    // state.error = action.payload;
                })

                .addCase(fetchReadyList.pending, (state) => {
                    state.ready_data.is_loading = true;
                    // state.error = undefined;
                })
                .addCase(fetchReadyList.fulfilled, (state) => {
                    state.ready_data.is_loading = false;
                })
                .addCase(fetchReadyList.rejected, (state, action) => {
                    state.ready_data.is_loading = false;
                    // state.error = action.payload;
                })


                .addCase(fetchWeekInfo.pending, (state) => {
                    state.week_info_is_loading = true;
                    // state.error = undefined;
                })
                .addCase(fetchWeekInfo.fulfilled, (state) => {
                    state.week_info_is_loading = false;
                })
                .addCase(fetchWeekInfo.rejected, (state, action) => {
                    state.week_info_is_loading = false;
                    // state.error = action.payload;
                })
        }
    }
)

export const {actions: eqActions} = eqSlice;
export const {reducer: eqReducer} = eqSlice;

