import {createEntityAdapter} from "@reduxjs/toolkit";
import {Product} from "@entities/Product";

export const ProductAdapter = createEntityAdapter<Product, number>({
    selectId: (product) => product.id,
});