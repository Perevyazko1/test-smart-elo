import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {department} from "entities/Department";

import {TaxControlData, TaxControlSchema} from "../types/TaxControlSchema";
import {fetchTaxControlList} from "../service/fetchTaxControlData/fetchTaxControlData";


export const initialState: TaxControlSchema = {
    is_loading: false,
    updated: false,

    product_name_filter: '',
    current_view_mode: 'Все тарификации',
    department_filter: {name: 'Все отделы', number: 0, piecework_wages: true, single: false}
}


export const taxControlSlice = createSlice({
        name: 'taxControl',
        initialState,
        reducers: {
            setTaxControlData: (state, action: PayloadAction<TaxControlData[]>) => {
                state.data = action.payload
            },
            setTaxControlUpdated: (state) => {
                state.updated = !state.updated
            },

            setDepartmentFilter: (state, action: PayloadAction<department>) => {
                state.department_filter = action.payload
            },

            setProductNameFilter: (state, action: PayloadAction<string>) => {
                state.product_name_filter = action.payload
            },

            setViewModes: (state, action: PayloadAction<string[]>) => {
                state.view_modes = action.payload
            },

            setCurrentViewFilter: (state, action: PayloadAction<string>) => {
                state.current_view_mode = action.payload
            },

            setDefaultFilters: (state) => {
                state.current_view_mode = initialState.current_view_mode;
                state.department_filter = initialState.department_filter;
                state.product_name_filter = initialState.product_name_filter;
            },
        },

        extraReducers: (builder) => {
            builder
                .addCase(fetchTaxControlList.pending, (state) => {
                    state.is_loading = true;
                    // state.error = undefined;
                })
                .addCase(fetchTaxControlList.fulfilled, (state) => {
                    state.is_loading = false;
                })
                .addCase(fetchTaxControlList.rejected, (state, action) => {
                    state.is_loading = false;
                    // state.error = action.payload;
                })

        }
    }
)

export const {actions: taxControlActions} = taxControlSlice;
export const {reducer: taxControlReducer} = taxControlSlice;

