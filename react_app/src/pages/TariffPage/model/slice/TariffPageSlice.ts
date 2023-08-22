import {createSlice} from "@reduxjs/toolkit";

import {tariffPageCardAdapter, TariffPageSchema} from "../types/types";
import {fetchTariffs} from "../service/fetchTariffs";
import {updateTariff} from "../service/updateTariff";

export const initialState: TariffPageSchema = {
    results: {
        ids: [],
        entities: {},
    },
    count: 0,
    isLoading: true,
    hasUpdated: false,
    next: null,
    previous: null,
}


const tariffPageSlice = createSlice({
    name: 'taxPageSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTariffs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTariffs.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                if (action.meta.arg.isNext) {
                    tariffPageCardAdapter.addMany(state.results, results)
                } else {
                    tariffPageCardAdapter.setAll(state.results, results)
                }
                state.next = props.next;
                state.count = props.count;
                state.previous = props.previous;
                state.isLoading = false;
            })
            .addCase(fetchTariffs.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(updateTariff.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(updateTariff.fulfilled, (state, action) => {
                tariffPageCardAdapter.upsertOne(state.results, action.payload)
                state.isLoading = false;
            })
            .addCase(updateTariff.rejected, (state) => {
                state.isLoading = false;
            })
    },
});


export const {actions: tariffPageSliceActions} = tariffPageSlice;
export const {reducer: tariffPageSliceReducer} = tariffPageSlice;
