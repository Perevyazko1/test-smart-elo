import {createEntityAdapter} from "@reduxjs/toolkit";
import {Product} from "@entities/Product";

export const ProductAdapter = createEntityAdapter<Product>({
    selectId: (product) => product.id,
});