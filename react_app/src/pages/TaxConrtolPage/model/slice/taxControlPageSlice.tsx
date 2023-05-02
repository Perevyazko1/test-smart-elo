import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {TaxControlData, TaxControlSchema} from "../types/TaxControlSchema";


export const initialState: TaxControlSchema = {
    is_loading: false
}


export const taxControlSlice = createSlice({
        name: 'taxControl',
        initialState,
        reducers: {
            setTaxControlData: (state, action: PayloadAction<TaxControlData[]>) => {
                state.data = action.payload
            },
        },

        // extraReducers: (builder) => {
        //     builder
        //         .addCase(fetchAwaitList.pending, (state) => {
        //             state.await_list_is_loading = true;
        //             // state.error = undefined;
        //         })
        //         .addCase(fetchAwaitList.fulfilled, (state) => {
        //             state.await_list_is_loading = false;
        //         })
        //         .addCase(fetchAwaitList.rejected, (state, action) => {
        //             state.await_list_is_loading = false;
        //             // state.error = action.payload;
        //         })
        //
        // }
    }
)

export const {actions: taxControlActions} = taxControlSlice;
export const {reducer: taxControlReducer} = taxControlSlice;

