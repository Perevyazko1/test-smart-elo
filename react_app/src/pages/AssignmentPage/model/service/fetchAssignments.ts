import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {extended_api_assignment_list} from "entities/Assignment";
import {AppRoutes} from "app/providers/Router";

interface fetchAssignmentsProps {
    url?: string,
    limit?: number,
    offset?: number,
    isNext: boolean,
}


export const fetchAssignments = createAsyncThunk<extended_api_assignment_list, fetchAssignmentsProps, ThunkConfig<string>>(
    'assignments/fetchAssignments',
    async (params: fetchAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;
        const {url, ...props} = params;

        try {
            let response

            if (url) {
                response = await extra.api.get<extended_api_assignment_list>(url);
            } else {
                response = await extra.api.get<extended_api_assignment_list>(AppRoutes.ASSIGNMENTS, {
                    params: {
                        ...props,
                    }
                });
            }
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