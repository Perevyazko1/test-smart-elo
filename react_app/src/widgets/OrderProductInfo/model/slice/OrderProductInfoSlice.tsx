import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {OrderProductInfoSchema} from "../type/OrderProductInfoSchema";


export const initialState: OrderProductInfoSchema = {
    show_modal: false,
}


export const orderProductInfoSlice = createSlice({
        name: 'orderProductInfo',
        initialState,
        reducers: {
            setShowModal: (state, action: PayloadAction<boolean>) => {
                state.show_modal = action.payload
            },
        }
    }
)

export const {actions: orderProductInfoActions} = orderProductInfoSlice;
export const {reducer: orderProductInfoReducer} = orderProductInfoSlice;

