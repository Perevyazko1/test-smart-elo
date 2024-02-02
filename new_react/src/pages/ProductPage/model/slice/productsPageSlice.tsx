import {createSlice} from "@reduxjs/toolkit";

import {ProductAdapter} from "@entities/Product";

import {ProductsSchema} from "../types/types";
import { fetchProducts } from "../service/fetchProducts";


export const initialState: ProductsSchema = {
    results: {
        ids: [],
        entities: {},
    },
    count: 0,
    isLoading: true,
    hasUpdated: false,
    next: null,
    previous: null,
};

const productsPageSlice = createSlice({
    name: 'productsPageSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                if (action.meta.arg.isNext) {
                    ProductAdapter.addMany(state.results, results)
                } else {
                    ProductAdapter.setAll(state.results, results)
                }
                state.next = props.next;
                state.count = props.count;
                state.previous = props.previous;
                state.isLoading = false;
            })
            .addCase(fetchProducts.rejected, (state) => {
                state.isLoading = false;
            })
    },
});


export const {actions: productsPageActions} = productsPageSlice;
export const {reducer: productsPageReducer} = productsPageSlice;
