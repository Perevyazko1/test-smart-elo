import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {AppRoutes} from "app/providers/Router";
import {getEmployeePinCode} from "entities/Employee";
import {product} from "entities/Product";

interface fetchProductDetailsProps {
    id: number,
}


export const fetchProductDetails = createAsyncThunk<product, fetchProductDetailsProps, ThunkConfig<string>>(
    'productDetails/fetchProductDetails',
    async (params: fetchProductDetailsProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;
        const pin_code = getEmployeePinCode(getState())

        try {
            const response = await extra.api.get<product>(`core/${AppRoutes.PRODUCTS}/${params.id}`, {
                params: {
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