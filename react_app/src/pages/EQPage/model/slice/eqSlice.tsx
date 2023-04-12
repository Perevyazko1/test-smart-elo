import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {order_product_list} from "entities/OrderProduct";
import {week_info} from "entities/WeekInfo";

import {EqSchema, ViewMode} from "../types/eqSchema";


export const initialState: EqSchema = {
    series_size: 1,
    current_view_mode: {name: "Личные наряды", key: 0},
    current_project: "Все проекты",
    eq_updated: false
}


export const eqSlice = createSlice({
        name: 'eq',
        initialState,
        reducers: {
            setAwaitList: (state, action: PayloadAction<order_product_list>) => {
                state.await_list = action.payload
            },
            setInWorkList: (state, action: PayloadAction<order_product_list>) => {
                state.in_work_list = action.payload
            },
            setReadyList: (state, action: PayloadAction<order_product_list>) => {
                state.ready_list = action.payload
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


            eqUpdated: (state) => {
                state.eq_updated = !state.eq_updated
            },
        }
    }
)

export const {actions: eqActions} = eqSlice;
export const {reducer: eqReducer} = eqSlice;

