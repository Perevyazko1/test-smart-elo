import React from "react";

import cls from "./OrderPage.module.scss";

import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {ordersPageReducer} from "../model/slice";

import {OrderPageNav} from "./OrderPageNav";
import {OrderPageBody} from "./OrderPageBody";


const initialReducers: ReducersList = {
    orders: ordersPageReducer,
}

export const OrdersPage = () => {


    return (
        <DynamicComponent reducers={initialReducers}>
            <ModalProvider>
                <QueryContext>
                    <div className={cls.pageContainer}>
                        <OrderPageNav/>

                        <OrderPageBody/>
                    </div>
                </QueryContext>
            </ModalProvider>
        </DynamicComponent>
    );
};
