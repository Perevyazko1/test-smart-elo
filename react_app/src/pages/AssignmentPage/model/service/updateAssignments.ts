import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {extended_api_assignment_list} from "entities/Assignment";

interface updateAssignmentsProps {
    id_list: number[],
    action: 'remove_confirmation'
}


export const updateAssignments = createAsyncThunk<extended_api_assignment_list, updateAssignmentsProps, ThunkConfig<string>>(
    'assignments/updateAssignments',
    async (params: updateAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<extended_api_assignment_list>('core/update_assignments/', {
                ...params,
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch
            (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)