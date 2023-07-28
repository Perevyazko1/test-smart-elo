import {product} from "entities/Product";

export interface ProductDetailsSchema {
    product: product | null;
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}