import {createSlice} from "@reduxjs/toolkit";

import {OrdersPageSchema} from "../types";
import {fetchOrders} from "../api";


export const initialState: OrdersPageSchema = {
    results: [],
    count: 0,
    isLoading: true,
    hasUpdated: false,
    next: null,
    previous: null,
};


const orderPageSlice = createSlice({
    name: 'orderPageSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                if (action.meta.arg.isNext) {
                    state.results = [...state.results, ...results]
                } else {
                    state.results = results
                }
                state.next = props.next;
                state.count = props.count;
                state.previous = props.previous;
                state.isLoading = false;
            })
            .addCase(fetchOrders.rejected, (state) => {
                state.isLoading = false;
            })
    },
});


export const {actions: ordersPageActions} = orderPageSlice;
export const {reducer: ordersPageReducer} = orderPageSlice;
