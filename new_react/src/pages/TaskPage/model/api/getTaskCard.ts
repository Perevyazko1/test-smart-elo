import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";

import {Task} from "@entities/Task";

interface getTaskCardProps {
    id: number;
}


export const getTaskCard = createAsyncThunk<Task, getTaskCardProps, ThunkConfig<string>>(
    'tasks/getTaskCard',
    async (params: getTaskCardProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {id, ...otherProps} = params;

        try {
            const response = await extra.api.get<Task>(`/tasks/tasks/${id}/`, {
                params: {
                    ...otherProps,
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)