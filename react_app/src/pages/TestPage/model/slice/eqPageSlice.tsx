import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {eqPageCardEntityAdapter} from "entities/EqPageCard";

import {fetchEqCards} from "../service/fetchEqCards/fetchEqCards";
import {eq_data, normalizedEqData} from "../types/eq_types";


const initialState: normalizedEqData = {
    next: null,
    previous: null,
    count: 0,
    results: eqPageCardEntityAdapter.getInitialState({
        ids: [],
        entities: {},
    }),

    is_loading: true,
    not_relevant_id: [],
    has_updated: false,
}


const eqPageSlice = createSlice({
        name: 'eqPageSlice',
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
                .addCase(fetchEqCards.pending, (state) => {
                    state.is_loading = true;
                })
                .addCase(fetchEqCards.fulfilled, (state, action: PayloadAction<eq_data>) => {
                    eqPageCardEntityAdapter.setAll(state.results, action.payload.results);
                    state.next = action.payload.next;
                    state.previous = action.payload.previous;
                    state.count = action.payload.count;

                    state.is_loading = false;
                })
                .addCase(fetchEqCards.rejected, (state) => {
                    state.is_loading = false;
                })
        }
    }
)



export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;
