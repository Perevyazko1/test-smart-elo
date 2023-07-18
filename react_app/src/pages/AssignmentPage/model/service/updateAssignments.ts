import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {extended_api_assignment_list, extendedAssignment} from "entities/Assignment";

interface updateAssignmentsProps {
    id_list: number[],
    action: 'remove_confirmation'
}


export const updateAssignments = createAsyncThunk<extendedAssignment[], updateAssignmentsProps, ThunkConfig<string>>(
    'assignments/updateAssignments',
    async (params: updateAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.post<extendedAssignment[]>('core/update_assignments/', {
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