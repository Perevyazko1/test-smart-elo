import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {extended_api_assignment_list} from "entities/Assignment";
import {AppRoutes} from "app/providers/Router";

interface fetchAssignmentsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchAssignments = createAsyncThunk<extended_api_assignment_list, fetchAssignmentsProps, ThunkConfig<string>>(
    'assignments/fetchAssignments',
    async (params: fetchAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<extended_api_assignment_list>(`core/${AppRoutes.ASSIGNMENTS}`, {
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
            return handleErrors(e, thunkAPI);
        }
    }
)