import React from "react";

import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";
import {AppContent} from "@shared/ui";

import {productsPageReducer} from "../model/slice/productsPageSlice";

import {ProductPageContent} from "./ProductPageContent";
import {ProductNavContent} from "./ProductNavContent";


const initialReducers: ReducersList = {
    products: productsPageReducer,
}

export const ProductPage = () => {

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <QueryContext>
                <ModalProvider>
                    <AppNavbar>
                        <ProductNavContent/>
                    </AppNavbar>

                    <AppContent>
                        <ProductPageContent/>
                    </AppContent>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
