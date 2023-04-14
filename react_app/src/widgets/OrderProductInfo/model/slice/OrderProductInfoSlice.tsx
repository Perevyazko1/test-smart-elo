import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {OrderProductInfoSchema} from "../type/OrderProductInfoSchema";
import {technological_process} from "entities/OrderProduct";


export const initialState: OrderProductInfoSchema = {
}


export const orderProductInfoSlice = createSlice({
        name: 'orderProductInfo',
        initialState,
        reducers: {
            setTechProcessList: (state, action: PayloadAction<technological_process[]>) => {
                state.tech_process_list = action.payload
            },
            setCurrentTechProcess: (state, action: PayloadAction<technological_process>) => {
                state.current_tech_process = action.payload
            },
        }
    }
)

export const {actions: orderProductInfoActions} = orderProductInfoSlice;
export const {reducer: orderProductInfoReducer} = orderProductInfoSlice;

