import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {order_product, order_product_list} from "entities/OrderProduct";
import {StateSchema} from "app/providers/StoreProvider";

import {eqListAdapter, ListControl} from "../types/eqSchema";
import {fetchReadyList} from "../service/fetchReadyList/fetchReadyList";
import {fetchNextReadyList} from "../service/fetchReadyList/fetchNextReadyList";
import {fetchReadyCard} from "../service/fetchReadyList/fetchReadyCard";


const initialState: ListControl = {
    results: eqListAdapter.getInitialState({
        ids: [],
        entities: {},
    }),
    is_loading: false,
    next: null,
    previous: null,
    count: 0,
    has_updated: false,
    not_relevant_id: [],
}

const eqReadyListSlice = createSlice({
    name: 'readyListSlice',
    initialState,
    reducers: {
        addNotRelevantId: (state, action: PayloadAction<number>) => {
            state.not_relevant_id = [...state.not_relevant_id, action.payload];
        },
        hasUpdated: (state) => {
            state.has_updated = !state.has_updated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReadyList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchReadyList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqListAdapter.setAll(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchReadyList.rejected, (state) => {
                state.is_loading = false;
            })

            .addCase(fetchNextReadyList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchNextReadyList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqListAdapter.addMany(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchNextReadyList.rejected, (state) => {
                state.is_loading = false;
            })

            .addCase(fetchReadyCard.fulfilled, (state, action: PayloadAction<order_product>) => {
                eqListAdapter.upsertOne(state.results, action.payload);
                state.not_relevant_id = state.not_relevant_id.filter(
                    (order_product_id) => order_product_id !== action.payload.id)
            })

            .addCase(fetchReadyCard.rejected, (state, action) => {
                if (action.error.message === "Rejected") {
                    eqListAdapter.removeOne(state.results, action.meta.arg.id);

                    state.not_relevant_id = state.not_relevant_id.filter(
                        (order_product_id) => order_product_id !== action.meta.arg.id)
                }
            })
    },
})

export const {reducer: eqReadyListReducer} = eqReadyListSlice;
export const {actions: eqReadyListActions} = eqReadyListSlice;

export const getEqReadyListData = eqListAdapter.getSelectors<StateSchema>(
    state => state.eqReadyList?.results || eqListAdapter.getInitialState());

export const getEqReadyList = (state: StateSchema) => state.eqReadyList;