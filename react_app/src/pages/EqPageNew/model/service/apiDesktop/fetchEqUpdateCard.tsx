import {createAsyncThunk} from "@reduxjs/toolkit";
import {eq_card} from "entities/EqPageCard";
import {ThunkConfig} from "../../../../../app/providers/StoreProvider";
import {getEqProjectFilter} from "../../selectors/apiSelectors/apiSelectors";
import {handleErrors} from "../../../../../shared/api/handleErrors";
import {eqFiltersActions} from "../../slice/eqFiltersSlice";

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

type UpdatedCards = Record<ListTypes, eq_card>;


export const fetchEqUpdateCard = createAsyncThunk<UpdatedCards, fetchEqUpdateCardProps, ThunkConfig<string>>(
    'eq/fetchEqUpdateCard',
    async (props: fetchEqUpdateCardProps, thunkAPI) => {

        const {extra, dispatch, getState} = thunkAPI;
        const {mode = 'POST', ...params} = props;
        const filters = getEqProjectFilter(getState());
        let response;
        try {

            if (mode === "GET") {
                response = await extra.api.get<UpdatedCards>('/core/get_card/', {
                    params: {
                        ...params,
                        ...filters,
                    }
                });
            } else {
                response = await extra.api.post<UpdatedCards>('/core/update_card/', {
                    ...params,
                    ...filters,
                });
            }

            if (response.data) {
                if (mode === "GET") {
                    dispatch(eqFiltersActions.excludeNotRelevantId(props.series_id))
                }
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)