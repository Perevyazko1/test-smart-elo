import {normalizedProductList} from "entities/Product";


export interface ProductsSchema extends normalizedProductList {
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}