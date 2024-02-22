import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

interface updateAssignmentsProps {
    id_list: number[],
    action: 'remove_confirmation',
    pin_code: number,
}


export const updateAssignments = createAsyncThunk<{ result: string }, updateAssignmentsProps, ThunkConfig<string>>(
    'assignments/updateAssignments',
    async (params: updateAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<{ result: string }>('core/update_assignments/', {
                ...params,
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