import {ProductAdapter} from "@entities/Product";
import {StateSchema} from "@app";

import {ProductsSchema} from "../types/types";

export const getProductsList = ProductAdapter.getSelectors<StateSchema>(
    state => state.products?.results || ProductAdapter.getInitialState()
);

export const getProductsProps = (state: StateSchema): Omit<ProductsSchema, 'results'> => {
    return {
        next: state.products?.next || null,
        previous: state.products?.previous || null,
        count: state.products?.count || 0,
        isLoading: state.products?.isLoading !== undefined ? state.products?.isLoading : true,
        hasUpdated: state.products?.hasUpdated,
    };
};
