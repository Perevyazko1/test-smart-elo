import {EqBodySchema} from "@pages/EqPage";
import {createSlice} from "@reduxjs/toolkit";

import {InitialEqBodySchema} from "../types/eqBodySchema";

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
    extraReducers: () => {
    }
});

export const {reducer: eqPageReducer} = eqPageSlice;
export const {actions: eqPageActions} = eqPageSlice;