import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {order_product_tables_data, OrderProductInfoSchema} from "../type/OrderProductInfoSchema";
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
            setOPTablesData: (state, action: PayloadAction<order_product_tables_data>) => {
                state.order_product_tables_data = action.payload
            },
        }
    }
)

export const {actions: orderProductInfoActions} = orderProductInfoSlice;
export const {reducer: orderProductInfoReducer} = orderProductInfoSlice;

