import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {AppRoutes} from "app/providers/Router";
import {getEmployeePinCode} from "entities/Employee";
import {product_list} from "entities/Product";

interface fetchProductsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchProducts = createAsyncThunk<product_list, fetchProductsProps, ThunkConfig<string>>(
    'products/fetchProducts',
    async (params: fetchProductsProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;
        const pin_code = getEmployeePinCode(getState())

        try {
            const response = await extra.api.get<product_list>(`core/${AppRoutes.PRODUCTS}`, {
                params: {
                    ...params,
                    pin_code: pin_code,
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)