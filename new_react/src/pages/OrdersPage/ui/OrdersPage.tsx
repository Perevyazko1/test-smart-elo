import React from "react";

import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {ordersPageReducer} from "../model/slice";

import {OrderPageNav} from "./OrderPageNav";
import {OrderPageBody} from "./OrderPageBody";
import {AppContent} from "@shared/ui";


const initialReducers: ReducersList = {
    orders: ordersPageReducer,
}

export const OrdersPage = () => {


    return (
        <DynamicComponent reducers={initialReducers}>
            <ModalProvider>
                <QueryContext>
                    <OrderPageNav/>

                    <AppContent>
                        <OrderPageBody/>
                    </AppContent>
                </QueryContext>
            </ModalProvider>
        </DynamicComponent>
    );
};
