import {createSlice} from "@reduxjs/toolkit";

import {ProductDetailsSchema} from "../types/productDetailsTypes";
import {fetchProductDetails} from "../service/fetchProduct";


export const initialState: ProductDetailsSchema = {
    product: null,
    isLoading: true,
    hasUpdated: false,
};

const productDetailsPageSlice = createSlice({
    name: 'productDetailsPageSlice',
    initialState,
    reducers: {
        hasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchProductDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.product = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchProductDetails.rejected, (state) => {
                state.isLoading = false;
            })
    },
});


export const {actions: productDetailsPageActions} = productDetailsPageSlice;
export const {reducer: productDetailsPageReducer} = productDetailsPageSlice;
