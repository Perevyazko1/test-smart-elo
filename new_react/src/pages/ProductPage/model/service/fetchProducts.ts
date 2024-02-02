import {createAsyncThunk} from "@reduxjs/toolkit";
import {ProductApiList} from "@entities/Product/types/product";
import {ThunkConfig} from "@app";

interface fetchProductsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchProducts = createAsyncThunk<ProductApiList, fetchProductsProps, ThunkConfig<string>>(
    'products/fetchProducts',
    async (params: fetchProductsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<ProductApiList>(`/core/products/`, {
                params: {
                    ...params,
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            console.error('Ошибка запроса к серверу: ', e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)