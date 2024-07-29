import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

export enum Actions {
    AWAIT_TO_IN_WORK = 'await_to_in_work',
    IN_WORK_TO_READY = 'in_work_to_ready',
    IN_WORK_TO_IN_WORK_DISTRIBUTE = 'in_work_to_in_work_distribute',
    READY_TO_IN_WORK = 'ready_to_in_work',
    IN_WORK_TO_AWAIT = 'in_work_to_await',
    IN_WORK_TO_AWAIT_DISTRIBUTE = 'in_work_to_await_distribute',
    CONFIRMED = 'confirmed',
}

interface fetchEqUpdateCardProps {
    op_id: number,
    department_id: number,
    action?: Actions,
    numbers?: number[],
    mode?: 'GET' | 'POST';
}


export const fetchEqUpdCard = createAsyncThunk<{}, fetchEqUpdateCardProps, ThunkConfig<string>>(
    'eq/fetchEqUpdateCard',
    async (props: fetchEqUpdateCardProps, thunkAPI) => {

        const {mode = 'POST', ...params} = props;

        let response;

        try {
            if (mode === "GET") {
                response = await thunkAPI.extra.api.get<{}>('/core/get_card/', {
                    params: {
                        ...params,
                    }
                });
            } else {
                const {op_id, action, numbers, ...otherParams} = params;
                response = await thunkAPI.extra.api.post<{}>('/core/update_card/',
                    {
                        op_id,
                        action,
                        numbers,
                    },
                    {
                        params: {
                            ...otherParams,
                        }
                    }
                );
            }

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