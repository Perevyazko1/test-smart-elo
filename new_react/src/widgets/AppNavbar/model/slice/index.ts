import {createSlice} from "@reduxjs/toolkit";
import {AppNavbarSchema} from "../types";
import {fetchHasNotifications} from "@widgets/AppNavbar/model/api/fetchHasNotifications";


export const initialState: AppNavbarSchema = {
    isLoading: true,
    hasUpdated: true,
    hasNotifications: false,
};


const appNavbarSlice = createSlice({
    name: 'appNavbarSlice',
    initialState,
    reducers: {
        listHasUpdated: (state) => {
            state.hasUpdated = !state.hasUpdated;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchHasNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchHasNotifications.fulfilled, (state, action) => {
                state.hasNotifications = action.payload.result;
                state.isLoading = false;
            })
            .addCase(fetchHasNotifications.rejected, (state) => {
                state.isLoading = false;
            })
    },
});

export const {reducer: appNavbarReducer} = appNavbarSlice;
export const {actions: appNavbarActions} = appNavbarSlice;
