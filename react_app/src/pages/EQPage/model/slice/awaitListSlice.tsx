import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {order_product, order_product_list} from "entities/OrderProduct";
import {StateSchema} from "app/providers/StoreProvider";
import {fetchAwaitList} from "../service/fetchAwaitList/fetchAwaitList";
import {fetchNextAwaitList} from "../service/fetchAwaitList/fetchNextAwaitList";
import {fetchAwaitCard} from "../service/fetchAwaitList/fetchAwaitCard";
import {eqListAdapter, ListControl} from "../types/eqSchema";


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

const eqAwaitListSlice = createSlice({
    name: 'awaitListSlice',
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
            .addCase(fetchAwaitList.pending, (state) => {
                state.is_loading = true;
            })

            .addCase(fetchAwaitList.fulfilled, (state, action: PayloadAction<order_product_list>) => {
                state.is_loading = false;
                eqListAdapter.setAll(state.results, action.payload.results);
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
                eqListAdapter.addMany(state.results, action.payload.results);
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.count = action.payload.count;
            })

            .addCase(fetchNextAwaitList.rejected, (state) => {
                state.is_loading = false;
            })

            // .addCase(fetchAwaitCard.pending, (state) => {
            //     state.is_loading = true;
            // })

            .addCase(fetchAwaitCard.fulfilled, (state, action: PayloadAction<order_product>) => {
                eqListAdapter.upsertOne(state.results, action.payload);
                state.not_relevant_id = state.not_relevant_id.filter(
                    (order_product_id) => order_product_id !== action.payload.id)
            })

            .addCase(fetchAwaitCard.rejected, (state, action) => {
                if (action.error.message === "Rejected") {
                    eqListAdapter.removeOne(state.results, action.meta.arg.id);

                    state.not_relevant_id = state.not_relevant_id.filter(
                        (order_product_id) => order_product_id !== action.meta.arg.id)
                }
            })
    },
})

export const {reducer: eqAwaitListReducer} = eqAwaitListSlice;
export const {actions: eqAwaitListActions} = eqAwaitListSlice;

export const getEqAwaitListData = eqListAdapter.getSelectors<StateSchema>(
    state => state.eqAwaitList?.results || eqListAdapter.getInitialState());

export const getEqAwaitList = (state: StateSchema) => state.eqAwaitList;