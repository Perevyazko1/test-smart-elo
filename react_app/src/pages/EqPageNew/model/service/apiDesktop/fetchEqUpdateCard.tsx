import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {eq_card} from "../../../../../entities/EqPageCard";
import {ThunkConfig} from "../../../../../app/providers/StoreProvider";
import {getEqProjectFilter} from "../../selectors/apiSelectors/apiSelectors";
import {notificationsActions} from "../../../../../widgets/Notification";

export enum Actions {
    AWAIT_TO_IN_WORK = 'await_to_in_work',
    IN_WORK_TO_READY = 'in_work_to_ready',
    READY_TO_IN_WORK = 'ready_to_in_work',
    IN_WORK_TO_AWAIT = 'in_work_to_await',
    CONFIRMED = 'confirmed',
}

interface fetchEqUpdateCardProps {
    action: Actions,
    series_id: string,
    numbers: number[],
}

type updated_cards = {
    await: eq_card,
    in_work: eq_card,
    ready: eq_card,
}

export const fetchEqUpdateCard = createAsyncThunk<updated_cards, fetchEqUpdateCardProps, ThunkConfig<string>>(
    'eq/fetchEqUpdateCard',
    async (params: fetchEqUpdateCardProps, thunkAPI) => {

        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());

        try {
            const response = await extra.api.post<updated_cards>('/core/update_card/', {
                ...params,
                ...filters,
            });

            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            if (e.response) {
                thunkAPI.dispatch(notificationsActions.addNotification({
                    date: Date.now(),
                    type: "ошибка",
                    title: "Ошибка сервера",
                    body: "Ошибка обработки запроса",
                    notAutoHide: true
                }))
                return thunkAPI.rejectWithValue('Ошибка сервера');
            } else if (e.request) {
                thunkAPI.dispatch(notificationsActions.addNotification({
                    date: Date.now(),
                    type: "ошибка",
                    title: "Ошибка связи",
                    body: "Ошибка связи с сервером, проверьте подключение",
                    notAutoHide: true
                }))
                return thunkAPI.rejectWithValue('Ошибка связи с сервером');
            } else {
                thunkAPI.dispatch(notificationsActions.addNotification({
                    date: Date.now(),
                    type: "ошибка",
                    title: "Ошибка запроса",
                    body: "Ошибка запроса данных. Попробуйте перезагрузить страницу.",
                    notAutoHide: true
                }))
                return thunkAPI.rejectWithValue('Ошибка запроса');
            }
        }
    }
)