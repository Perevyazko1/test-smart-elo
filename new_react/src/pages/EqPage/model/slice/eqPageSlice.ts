import {EqBodySchema} from "@pages/EqPage";
import {createSlice} from "@reduxjs/toolkit";

import {InitialEqBodySchema} from "../types/eqBodySchema";
import {fetchEqFilters} from "../api/fetchEqFilters";
import {fetchWeekData} from "../api/fetchWeekData";

const initialState: EqBodySchema = InitialEqBodySchema;

const eqPageSlice = createSlice({
    name: 'eqPageSlice',
    initialState,
    reducers: {
        awaitUpdated: (state) => {
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated;
        },
        inWorkUpdated: (state) => {
            state.inWorkList.hasUpdated = !state.inWorkList.hasUpdated;
        },
        readyListHasUpdated: (state) => {
            state.readyList.hasUpdated = !state.readyList.hasUpdated;
        },

        allListUpdated: (state) => {
            state.readyList.hasUpdated = !state.readyList.hasUpdated;
            state.inWorkList.hasUpdated = !state.inWorkList.hasUpdated;
            state.awaitList.hasUpdated = !state.awaitList.hasUpdated;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEqFilters.pending, (state) => {
                state.projects.isLoading = true;

                state.viewModes.isLoading = true;
            })

            .addCase(fetchEqFilters.fulfilled, (state, action) => {
                state.projects.filters = action.payload.project_filters;
                state.projects.isLoading = false;

                state.viewModes.filters = action.payload.view_modes;
                state.viewModes.isLoading = false;
            })

            .addCase(fetchEqFilters.rejected, (state) => {
                state.projects.isLoading = false;
                state.viewModes.isLoading = false;
            })

            .addCase(fetchWeekData.pending, (state) => {
                state.weekData.isLoading = true;
            })

            .addCase(fetchWeekData.fulfilled, (state, action) => {
                state.weekData = {...state.weekData, ...action.payload};
                state.weekData.isLoading = false;
            })

            .addCase(fetchWeekData.rejected, (state) => {
                state.weekData.isLoading = false;
            })
    }
});

export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;