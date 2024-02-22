import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {AssignmentApiList} from "@entities/Assignment";
import {errorApiHandler} from "@shared/api";

interface fetchAssignmentsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchAssignments = createAsyncThunk<AssignmentApiList, fetchAssignmentsProps, ThunkConfig<string>>(
    'assignments/fetchAssignments',
    async (params: fetchAssignmentsProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get<AssignmentApiList>('/core/assignments', {
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