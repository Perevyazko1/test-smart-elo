import React from "react";

import cls from './ProductPage.module.scss';

import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";

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
                    <div className={cls.pageContainer}>
                        <AppNavbar>
                            <ProductNavContent/>
                        </AppNavbar>

                        <ProductPageContent/>
                    </div>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
