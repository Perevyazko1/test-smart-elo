import {createSlice} from '@reduxjs/toolkit';
import {AuthByPinCodeSchema} from "../types/authByPinCodeSchema";


const initialState: AuthByPinCodeSchema = {
    pinCode: 0,
    isLoading: false,
    rememberMe: false
}


export const authByPinCodeSlice = createSlice({
    name: 'authByPinCode',
    initialState,
    reducers: {
        setPinCode: (state, action) => {
            console.log(action.payload)
            state.pinCode = action.payload
        },
        setRememberMe: (state, action) => {
            state.rememberMe = action.payload
        }
    }
})

export const {actions: authByPinCodeActions} = authByPinCodeSlice;
export const {reducer: authByPinCodeReducer} = authByPinCodeSlice;

