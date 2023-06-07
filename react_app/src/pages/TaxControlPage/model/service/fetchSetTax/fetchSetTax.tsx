import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "app/providers/StoreProvider";
import {notificationsActions} from "widgets/Notification";

export enum SetTaxModes {
    ALL_UNCHARGED = 'ALL_UNCHARGED',
    EXCEPT_READY = 'EXCEPT_READY',
}

interface fetchSetTaxProps {
    product_id: number,
    tariff: number,
    mode: SetTaxModes,
    pin_code: number,
    department_number: number,
}

export const fetchSetTax = createAsyncThunk<any, fetchSetTaxProps, ThunkConfig<string>>(
    'taxControl/fetchSetTax',
    async (params: fetchSetTaxProps, thunkAPI) => {

        const {extra, dispatch} = thunkAPI;

        try {
            const response = await extra.api.post('/core/set_production_step_tax/', {
                ...params
            });

            if (response.data) {
                dispatch(notificationsActions.addNotification({
                    title: 'Тарификация',
                    body: 'Тарификация успешно обновлена',
                    type: 'оповещение',
                    date: Date.now()
                }))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            dispatch(notificationsActions.addNotification({
                title: 'Тарификация',
                body: 'Ошибка обновления!',
                type: 'ошибка',
                date: Date.now()
            }))
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)