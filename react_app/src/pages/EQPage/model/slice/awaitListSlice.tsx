import {createEntityAdapter, createSlice, EntityState, PayloadAction} from '@reduxjs/toolkit';

import {order_product, order_product_list} from "entities/OrderProduct";
import {StateSchema} from "app/providers/StoreProvider";
import {fetchAwaitList} from "../service/fetchAwaitList/fetchAwaitList";
import {fetchNextAwaitList} from "../service/fetchAwaitList/fetchNextAwaitList";


interface IOrderProductList extends Omit<order_product_list, 'results'> {
    results: EntityState<order_product>
}

export interface ListControl extends IOrderProductList {
    is_loading: boolean,
    has_updated: boolean,
}

const eqAwaitListAdapter = createEntityAdapter<order_product>({
    selectId: (order_product) => order_product.series_id,
})

const initialState: ListControl = {
    results: eqAwaitListAdapter.getInitialState({
        ids: [],
        entities: {},
    }),
    is_loading: false,
    next: null,
    previous: null,
    count: 0,
    has_updated: false,
}

const eqAwaitListSlice = createSlice({
    name: 'awaitListSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAwaitList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchAwaitList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqAwaitListAdapter.setAll(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchAwaitList.rejected, (state) => {
                state.is_loading = false;
            })

            .addCase(fetchNextAwaitList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchNextAwaitList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqAwaitListAdapter.addMany(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchNextAwaitList.rejected, (state) => {
                state.is_loading = false;
            })
    },
})

export const {reducer: eqAwaitListReducer} = eqAwaitListSlice;

export const getEqAwaitListData = eqAwaitListAdapter.getSelectors<StateSchema>(
    state => state.eqAwaitList?.results || eqAwaitListAdapter.getInitialState());

export const getEqAwaitList = (state: StateSchema) => state.eqAwaitList;