import {createAsyncThunk} from "@reduxjs/toolkit";

import {notificationsActions} from "widgets/Notification";
import {eq_page_list} from "entities/EqPageCard";
import {ThunkConfig} from "app/providers/StoreProvider";

import {getEqProjectFilter} from "../../selectors/apiSelectors/apiSelectors";

interface fetchListDataProps {
    target_list: 'await' | 'in_work' | 'ready',
    limit?: number,
    offset?: number,
    url?: string,
}


export const fetchListData = createAsyncThunk<eq_page_list, fetchListDataProps, ThunkConfig<string>>(
    'eq/fetchListData',
    async (params: fetchListDataProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());
        const {url, ...props} = params;

        try {
            let response

            if (url) {
                response = await extra.api.get<eq_page_list>(url);
            } else {
                response = await extra.api.get<eq_page_list>('/core/get_eq_cards/', {
                    params: {
                        ...filters,
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