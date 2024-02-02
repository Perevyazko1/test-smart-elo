import {NorProductList} from "@entities/Product/types/product";


export interface ProductsSchema extends NorProductList {
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}