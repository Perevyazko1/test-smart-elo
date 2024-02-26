import { Product } from "@entities/Product";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";


interface fetchProductDetailsProps {
    id: number,
}


export const fetchProductDetails = createAsyncThunk<Product, fetchProductDetailsProps, ThunkConfig<string>>(
    'productDetails/fetchProductDetails',
    async (params: fetchProductDetailsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<Product>(`core/products/${params.id}`);
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            errorApiHandler(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)