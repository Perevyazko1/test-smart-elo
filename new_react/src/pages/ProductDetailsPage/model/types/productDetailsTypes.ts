import {Product} from "@entities/Product";

export interface ProductDetailsSchema {
    product: Product | null;
    isLoading: boolean;
    hasUpdated: boolean | undefined;
}