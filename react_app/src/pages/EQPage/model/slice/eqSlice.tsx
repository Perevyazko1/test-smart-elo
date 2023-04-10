import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {order_product_list} from "entities/OrderProduct/model/types/orderProduct";

import {EqSchema} from "../types/eqSchema";


const initialState: EqSchema = {
    eq_updated: false
}


export const eqSlice = createSlice({
        name: 'eq',
        initialState,
        reducers: {
            setAwaitList: (state, action: PayloadAction<order_product_list>) => {
                state.await_list = action.payload
            },
            setInWorkList: (state, action: PayloadAction<order_product_list>) => {
                state.in_work_list = action.payload
            },
            setReadyList: (state, action: PayloadAction<order_product_list>) => {
                state.ready_list = action.payload
            },
            eqUpdated: (state) => {
                state.eq_updated = !state.eq_updated
            },
        }
    }
)

export const {actions: eqActions} = eqSlice;
export const {reducer: eqReducer} = eqSlice;

