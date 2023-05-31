import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {order_product, order_product_list} from "entities/OrderProduct";
import {StateSchema} from "app/providers/StoreProvider";
import {eqListAdapter, ListControl} from "../types/eqSchema";
import {fetchNextInWorkList} from "../service/fetchInWorkList/fetchNextInWorkList";
import {fetchInWorkCard} from "../service/fetchInWorkList/fetchInWorkCard";
import {fetchInWorkList} from "../service/fetchInWorkList/fetchInWorkList";


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

const eqInWorkListSlice = createSlice({
    name: 'inWorkListSlice',
    initialState,
    reducers: {
        addNotRelevantId: (state, action: PayloadAction<number>) => {
            state.not_relevant_id = [...state.not_relevant_id, action.payload]
        },
        hasUpdated: (state) => {
            state.has_updated = !state.has_updated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInWorkList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchInWorkList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqListAdapter.setAll(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchInWorkList.rejected, (state) => {
                state.is_loading = false;
            })

            .addCase(fetchNextInWorkList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchNextInWorkList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqListAdapter.addMany(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchNextInWorkList.rejected, (state) => {
                state.is_loading = false;
            })

            .addCase(fetchInWorkCard.fulfilled, (state, action: PayloadAction<order_product>) => {
                eqListAdapter.upsertOne(state.results, action.payload);
                state.not_relevant_id = state.not_relevant_id.filter(
                    (order_product_id) => order_product_id !== action.payload.id)
            })

            .addCase(fetchInWorkCard.rejected, (state, action) => {
                if (action.error.message === "Rejected") {
                    eqListAdapter.removeOne(state.results, action.meta.arg.id);

                    state.not_relevant_id = state.not_relevant_id.filter(
                        (order_product_id) => order_product_id !== action.meta.arg.id)
                }
            })
    },
})

export const {reducer: eqInWorkListReducer} = eqInWorkListSlice;
export const {actions: eqInWorkListActions} = eqInWorkListSlice;

export const getEqInWorkListData = eqListAdapter.getSelectors<StateSchema>(
    state => state.eqInWorkList?.results || eqListAdapter.getInitialState());

export const getEqInWorkList = (state: StateSchema) => state.eqInWorkList;