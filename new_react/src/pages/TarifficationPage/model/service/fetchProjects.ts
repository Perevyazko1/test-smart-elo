import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

interface fetchProjectsProps {
    mode: 'all' | 'active';
}


export const fetchProjects = createAsyncThunk<{ project_list: [string] }, fetchProjectsProps, ThunkConfig<string>>(
    'tariffication/fetchProjects',
    async (params: fetchProjectsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<{ project_list: [string] }>('core/tariffication/projects', {
                params: {
                    ...params,
                },
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