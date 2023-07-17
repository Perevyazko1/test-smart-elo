import {createSlice} from "@reduxjs/toolkit";
import {
    extendedAssignmentEntityAdapter,
} from "entities/Assignment";

import {AssignmentSchema} from "../types/types";
import {fetchAssignments} from "../service/fetchAssignments";


export const initialState: AssignmentSchema = {
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

const assignmentPageSlice = createSlice({
    name: 'assignmentPageSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                const {results, ...props} = action.payload;
                if (action.meta.arg.isNext) {
                    extendedAssignmentEntityAdapter.addMany(state.results, results)
                } else {
                    extendedAssignmentEntityAdapter.setAll(state.results, results)
                }
                state.next = props.next;
                state.count = props.count;
                state.previous = props.previous;
                state.isLoading = false;
            })
            .addCase(fetchAssignments.rejected, (state) => {
                state.isLoading = false;
            })
    },
});


export const {actions: assignmentPageActions} = assignmentPageSlice;
export const {reducer: assignmentPageReducer} = assignmentPageSlice;
