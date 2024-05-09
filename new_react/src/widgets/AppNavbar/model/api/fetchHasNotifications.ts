import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";


interface fetchHasNotificationsProps {
}

export const fetchHasNotifications = createAsyncThunk<{result: boolean}, fetchHasNotificationsProps, ThunkConfig<string>>(
    'appNavbar/fetchHasNotifications',
    async (params: fetchHasNotificationsProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {...extraData} = params;
        const url = 'staff/tasks/check_tasks_exists/'
        try {
            const response = await extra.api.get<{result: boolean}>(url, {
                    ...extraData,
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