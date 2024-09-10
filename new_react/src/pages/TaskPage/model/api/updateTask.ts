import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {Task, UpdateTask} from "@entities/Task";


export const updateTask = createAsyncThunk<Task, UpdateTask, ThunkConfig<string>>(
    'tasks/updateTask',
    async (params: UpdateTask, thunkAPI) => {
        const {extra} = thunkAPI;
        const {id, ...otherFields} = params;

        try {
            const response = await extra.api.patch<Task>(
                `/tasks/tasks/${id}/`,
                otherFields,
                {
                    params: {
                        update_mode: 'excludeMe'
                    }
                }
            );
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