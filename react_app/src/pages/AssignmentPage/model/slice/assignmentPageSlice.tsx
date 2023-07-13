import {createSlice} from "@reduxjs/toolkit";


export const initialState = {};

const assignmentPageSlice = createSlice({
    name: 'assignmentPageSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {},
});


export const {actions: assignmentPageActions} = assignmentPageSlice;
export const {reducer: assignmentPageReducer} = assignmentPageSlice;
