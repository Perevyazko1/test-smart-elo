import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {prepareFormData} from "@shared/lib";

import {Task, UpdateTask} from "../types";


export const updateTask = createAsyncThunk<Task, UpdateTask, ThunkConfig<string>>(
    'tasks/updateTask',
    async (params: UpdateTask, thunkAPI) => {
        const {extra} = thunkAPI;
        const {id, ...otherFields} = params;

        const formData = prepareFormData({...otherFields});

        try {
            const response = await extra.api.patch<Task>(
                `/tasks/tasks/${id}/`,
                formData,
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