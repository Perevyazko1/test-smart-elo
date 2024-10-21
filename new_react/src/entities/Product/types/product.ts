import {ProductPicture} from "@entities/ProductPicture";
import {TechProcess} from "@entities/TechProcess";
import {EntityState} from "@reduxjs/toolkit";
import {ApiList} from "@shared/types";

export interface BaseProduct {
    id: number;
    name: string;
    product_pictures: number[] | null;
    technological_process: number | null;
    technological_process_confirmed: number | null;
}

type ExtendedFields = 'product_pictures' | 'technological_process';

export interface Product extends Omit<BaseProduct, ExtendedFields> {
    product_pictures: ProductPicture[];
    technological_process: TechProcess | null;
}

export interface ProductApiList extends ApiList<Product> {
}

export interface NorProductList extends Omit<ProductApiList, 'results'> {
    results: EntityState<Product, number>
}

