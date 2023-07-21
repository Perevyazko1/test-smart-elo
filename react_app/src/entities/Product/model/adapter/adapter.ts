import {createEntityAdapter} from "@reduxjs/toolkit";

import {product} from "../type/product";


export const productEntityAdapter = createEntityAdapter<product>({
    selectId: (product) => product.id,
});
