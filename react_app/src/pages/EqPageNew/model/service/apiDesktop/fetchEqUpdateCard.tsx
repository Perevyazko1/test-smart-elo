import {createAsyncThunk} from "@reduxjs/toolkit";
import {eq_card} from "entities/EqPageCard";
import {ThunkConfig} from "../../../../../app/providers/StoreProvider";
import {getEqProjectFilter} from "../../selectors/apiSelectors/apiSelectors";
import {handleErrors} from "../../../../../shared/api/handleErrors";

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
}

type updated_cards = {
    await: eq_card,
    in_work: eq_card,
    ready: eq_card,
}

export const fetchEqUpdateCard = createAsyncThunk<updated_cards, fetchEqUpdateCardProps, ThunkConfig<string>>(
    'eq/fetchEqUpdateCard',
    async (props: fetchEqUpdateCardProps, thunkAPI) => {

        const {extra, getState} = thunkAPI;
        const {mode = 'POST', ...params} = props;
        const filters = getEqProjectFilter(getState());
        let response;
        try {

            if (mode === "GET") {
                response = await extra.api.get<updated_cards>('/core/get_card/', {
                    params: {
                        ...params,
                        ...filters,
                    }
                });
            } else {
                response = await extra.api.post<updated_cards>('/core/update_card/', {
                    ...params,
                    ...filters,
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