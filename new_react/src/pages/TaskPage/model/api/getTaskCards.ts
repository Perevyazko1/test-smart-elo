import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";
import {Task} from "../types";
import {TaskStatus} from "@pages/TaskPage";

interface getTaskCardsProps {
    status: TaskStatus;
    view_mode: string | undefined;
    sort_mode: string | undefined;
    week?: string | undefined;
    year?: string | undefined;
}


export const getTaskCards = createAsyncThunk<Task[], getTaskCardsProps, ThunkConfig<string>>(
    'tasks/getTaskCards',
    async (params: getTaskCardsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<Task[]>('/tasks/tasks/', {
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