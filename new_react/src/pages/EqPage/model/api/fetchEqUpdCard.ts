import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "@app";
import {eqPageActions} from "@pages/EqPage";
import {errorApiHandler} from "@shared/api";
import {EqOrderProduct} from "@pages/EqPage/model/types";

export enum Actions {
    AWAIT_TO_IN_WORK = 'await_to_in_work',
    IN_WORK_TO_READY = 'in_work_to_ready',
    READY_TO_IN_WORK = 'ready_to_in_work',
    IN_WORK_TO_AWAIT = 'in_work_to_await',
    CONFIRMED = 'confirmed',
}

interface fetchEqUpdateCardProps {
    series_id: string,
    department_id: number,
    action?: Actions,
    numbers?: number[],
    mode?: 'GET' | 'POST';
}

type ListTypes = 'in_work' | 'await' | 'ready';

type UpdatedCards = Record<ListTypes, EqOrderProduct>;


export const fetchEqUpdCard = createAsyncThunk<UpdatedCards, fetchEqUpdateCardProps, ThunkConfig<string>>(
    'eq/fetchEqUpdateCard',
    async (props: fetchEqUpdateCardProps, thunkAPI) => {

        const {extra, dispatch} = thunkAPI;
        const {mode = 'POST', ...params} = props;

        let response;

        try {
            if (mode === "GET") {
                response = await extra.api.get<UpdatedCards>('/core/get_card/', {
                    params: {
                        ...params,
                    }
                });
            } else {
                const {series_id, action, numbers, ...otherParams} = params;
                response = await extra.api.post<UpdatedCards>('/core/update_card/',
                    {
                        series_id,
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
                if (mode === "GET") {
                    dispatch(eqPageActions.excludeNotRelevantId(props.series_id))
                }
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