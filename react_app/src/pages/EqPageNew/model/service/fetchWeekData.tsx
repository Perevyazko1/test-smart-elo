import {createAsyncThunk} from "@reduxjs/toolkit";

import {notificationsActions} from "widgets/Notification";
import {ThunkConfig} from "app/providers/StoreProvider";

import {getEqProjectFilter} from "../selectors/apiSelectors/apiSelectors";
import {ViewMode} from "../types/eqPageSchema";
import {week_info} from "../../../../entities/WeekInfo";

type fetchWeekDataProps = {
}

export const fetchWeekData = createAsyncThunk<week_info, fetchWeekDataProps, ThunkConfig<string>>(
    'eq/fetchWeekData',
    async (params: fetchWeekDataProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());

        try {
            const response = await extra.api.get<week_info>('/core/get_week_data/', {
                params: {
                    ...filters,
                    ...params,
                }
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