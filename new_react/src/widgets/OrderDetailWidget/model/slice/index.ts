import {createSlice} from "@reduxjs/toolkit";

import {OrderDetailsSchema} from "../types";
import {fetchOrderDetail} from "../api/fetchOrderDetail";
import {fetchAddComment} from "../api/fetchAddComment";


export const initialState: OrderDetailsSchema = {
    data: null,
    hasUpdated: false,
    isLoading: true,
};


const orderDetailSlice = createSlice({
    name: 'orderDetailSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderDetail.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOrderDetail.fulfilled, (state, action) => {
                state.data = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchOrderDetail.rejected, (state) => {
                state.isLoading = false;
            })


            .addCase(fetchAddComment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAddComment.fulfilled, (state, action) => {
                const orderProducts = state.data?.order_products;
                const data = orderProducts?.filter(op => op.series_id !== action.meta.arg.series_id);
                const newOrderProducts = [];
                data && newOrderProducts.push(...data);
                newOrderProducts.push(action.payload);
                newOrderProducts.sort(
                    (a, b) => a.id - b.id
                );

                if (state.data) {
                    state.data.order_products = newOrderProducts;
                }
                state.isLoading = false;
            })
            .addCase(fetchAddComment.rejected, (state) => {
                state.isLoading = false;
            })
    },
});

export const {reducer: ordersDetailReducer} = orderDetailSlice;
