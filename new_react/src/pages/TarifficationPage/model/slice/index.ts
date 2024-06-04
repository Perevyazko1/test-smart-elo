import {createSlice} from "@reduxjs/toolkit";

import {TarifficationPageSchema} from "../types";

import {fetchProjects} from "../service/fetchProjects";
import {fetchTariffications} from "../service/fetchTariffications";
import {fetchSetProposedTariff} from "../service/fetchSetProposedTariff";
import {fetchTariffication} from "../service/fetchTariffication";
import {fetchSetConfirmedTariff} from "@pages/TarifficationPage/model/service/fetchSetConfirmendTariff";

export const initialState: TarifficationPageSchema = {
    isLoading: true,
    hasUpdated: false,
    projects: [],
    count: 0,
    next: null,
    previous: null,
    results: [],
    noRelevantIds: [],
}

const tarifficationPageSlice = createSlice({
    name: 'tarifficationPageSlice',
    initialState,
    reducers: {
        addNoRelevantId: (state, action) => {
            state.noRelevantIds = [...state.noRelevantIds, action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.projects = action.payload.project_list;
                state.isLoading = false;
            })
            .addCase(fetchProjects.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(fetchTariffications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTariffications.fulfilled, (state, action) => {
                if (action.meta.arg.isNext) {
                    state.results = [...state.results, ...action.payload.results]
                } else {
                    state.results = action.payload.results;
                }
                state.count = action.payload.count;
                state.next = action.payload.next;
                state.previous = action.payload.previous;

                state.isLoading = false;
            })
            .addCase(fetchTariffications.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(fetchSetProposedTariff.pending, (state) => {
            })
            .addCase(fetchSetProposedTariff.fulfilled, (state, action) => {
            })
            .addCase(fetchSetProposedTariff.rejected, (state) => {
            })

            .addCase(fetchSetConfirmedTariff.pending, (state) => {
            })
            .addCase(fetchSetConfirmedTariff.fulfilled, (state, action) => {
            })
            .addCase(fetchSetConfirmedTariff.rejected, (state) => {
            })

            .addCase(fetchTariffication.pending, (state) => {
            })
            .addCase(fetchTariffication.fulfilled, (state, action) => {
                state.results = state.results.map(item =>
                    item.id === action.meta.arg.itemId
                        ? action.payload
                        : item
                )
                state.noRelevantIds = state.noRelevantIds.filter(itemId => itemId !== action.meta.arg.itemId)
            })
            .addCase(fetchTariffication.rejected, (state) => {
            })
    },
});


export const {actions: tarifficationPageActions} = tarifficationPageSlice;
export const {reducer: tarifficationPageReducer} = tarifficationPageSlice;
