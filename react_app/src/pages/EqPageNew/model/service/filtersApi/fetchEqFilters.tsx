import {createAsyncThunk} from "@reduxjs/toolkit";

import {notificationsActions} from "widgets/Notification";
import {ThunkConfig} from "app/providers/StoreProvider";

import {getEqProjectFilter} from "../../selectors/apiSelectors/apiSelectors";
import {ViewMode} from "../../types/eqPageSchema";

type fetchEqFiltersProps = {
    mode: 'all' | 'actual';
}

interface EqFilters {
    mode: 'all' | 'actual';
    view_modes: ViewMode[];
    project_filters: string[];
}

export const fetchEqFilters = createAsyncThunk<EqFilters, fetchEqFiltersProps, ThunkConfig<string>>(
    'eq/fetchEqFilters',
    async (params: fetchEqFiltersProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());

        try {
            const response = await extra.api.get<EqFilters>('/core/get_eq_filters/', {
                params: {
                    ...params,
                    ...filters,
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