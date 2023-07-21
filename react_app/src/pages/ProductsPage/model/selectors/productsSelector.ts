import {StateSchema} from "app/providers/StoreProvider";
import {productEntityAdapter} from "entities/Product";

import {ProductsSchema} from "../types/types";

export const getProductsList = productEntityAdapter.getSelectors<StateSchema>(
    state => state.products?.results || productEntityAdapter.getInitialState()
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
