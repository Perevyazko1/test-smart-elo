import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthByPinCodeSchema} from "../types/authByPinCodeSchema";
import {authByPinCode} from "../services/authByPinCode/authByPinCode";


const initialState: AuthByPinCodeSchema = {
    pinCode: 0,
    isLoading: false,
    rememberMe: false
}


export const authByPinCodeSlice = createSlice({
    name: 'authByPinCode',
    initialState,
    reducers: {
        setPinCode: (state, action: PayloadAction<number>) => {
            state.pinCode = action.payload
        },
        setRememberMe: (state, action: PayloadAction<boolean>) => {
            state.rememberMe = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(authByPinCode.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(authByPinCode.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(authByPinCode.rejected, (state, action) => {
                state.error = action.payload
            })
    }
})

export const {actions: authByPinCodeActions} = authByPinCodeSlice;
export const {reducer: authByPinCodeReducer} = authByPinCodeSlice;

