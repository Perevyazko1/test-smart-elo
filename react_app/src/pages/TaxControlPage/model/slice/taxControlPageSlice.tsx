import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {department} from "entities/Department";

import {TaxControlData, TaxControlList, TaxControlSchema} from "../types/TaxControlSchema";
import {fetchTaxControlList} from "../service/fetchTaxControlData/fetchTaxControlData";
import {fetchNextTaxControlData} from "../service/fetchNextTaxControlData/fetchNextTaxControlData";


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
                })
                .addCase(fetchTaxControlList.fulfilled, (state, action: PayloadAction<TaxControlList>) => {
                    state.is_loading = false;
                    state.data = action.payload;
                })
                .addCase(fetchTaxControlList.rejected, (state) => {
                    state.is_loading = false;
                })

                .addCase(fetchNextTaxControlData.pending, (state) => {
                    state.is_loading = true;
                })
                .addCase(fetchNextTaxControlData.fulfilled, (state, action: PayloadAction<TaxControlList>) => {
                    state.is_loading = false;
                    if (state.data?.results) {
                        state.data.results = [...state.data.results, ...action.payload.results];
                        state.data.next = action.payload.next;
                        state.data.previous = action.payload.previous;
                    }
                })
                .addCase(fetchNextTaxControlData.rejected, (state) => {
                    state.is_loading = false;
                })


        }
    }
)

export const {actions: taxControlActions} = taxControlSlice;
export const {reducer: taxControlReducer} = taxControlSlice;

