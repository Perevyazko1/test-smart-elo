import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {tech_process_schema, technological_process} from "entities/TechnologicalProcess";

import {order_product_tables_data, OrderProductInfoSchema} from "../type/OrderProductInfoSchema";


export const initialState: OrderProductInfoSchema = {
    change_tech_process: false,
    show_constructor: false,
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

            setChangeTP: (state, action: PayloadAction<boolean>) => {
                state.change_tech_process = action.payload
            },

            setShowConstructor: (state, action: PayloadAction<boolean>) => {
                state.show_constructor = action.payload
            },
            setConstructorSchema: (state, action: PayloadAction<tech_process_schema>) => {
                state.constructor_schema = action.payload
            }
        }
    }
)

export const {actions: orderProductInfoActions} = orderProductInfoSlice;
export const {reducer: orderProductInfoReducer} = orderProductInfoSlice;

