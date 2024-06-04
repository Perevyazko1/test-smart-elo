import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {PostTarifficationData} from "@widgets/PostTarifficationWidget/model/types";


interface fetchPostTarifficationDataProps {
    production_step__id: number;
}

export const fetchPostTarifficationData = createAsyncThunk<PostTarifficationData, fetchPostTarifficationDataProps, ThunkConfig<string>>(
    'postTariffication/fetchPostTarifficationData',
    async (params: fetchPostTarifficationDataProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<PostTarifficationData>(`/core/tariffication/get_post_tariffication_list`, {
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
            errorApiHandler(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)