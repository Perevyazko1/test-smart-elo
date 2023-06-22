import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getCurrentDepartment} from "entities/Employee";
import {eq_data} from "../../types/eq_types";

interface fetchAwaitListProps {
    limit: number,
    offset: number,
}


export const fetchEqCards = createAsyncThunk<eq_data, fetchAwaitListProps, ThunkConfig<string>>(
    'eq/fetchEqCards',
    async (params: fetchAwaitListProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        // const current_department = getCurrentDepartment(getState());
        try {
            const response = await extra.api.get<eq_data>('/core/get_eq_cards/', {
                params: {
                    department_number: 1,
                    ...params
                }
            });
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)