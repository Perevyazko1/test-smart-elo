import {createAsyncThunk} from "@reduxjs/toolkit";
import {EqCardType} from "@pages/EqPage/model/types/eqCardType";
import {ThunkConfig} from "@app";
import {eqPageActions} from "@pages/EqPage";

export enum Actions {
    AWAIT_TO_IN_WORK = 'await_to_in_work',
    IN_WORK_TO_READY = 'in_work_to_ready',
    READY_TO_IN_WORK = 'ready_to_in_work',
    IN_WORK_TO_AWAIT = 'in_work_to_await',
    CONFIRMED = 'confirmed',
}

interface fetchEqUpdateCardProps {
    action?: Actions,
    series_id: string,
    numbers?: number[],
    mode?: 'GET' | 'POST';
    variant: 'desktop' | 'mobile';
}

type ListTypes = 'in_work' | 'await' | 'ready' | 'mobile';

type UpdatedCards = Record<ListTypes, EqCardType>;


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
                response = await extra.api.post<UpdatedCards>('/core/update_card/', {
                    ...params,
                });
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
            console.log(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)