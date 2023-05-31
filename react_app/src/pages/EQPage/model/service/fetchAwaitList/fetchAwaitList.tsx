import {createAsyncThunk} from "@reduxjs/toolkit";
import {order_product_list} from "entities/OrderProduct";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";
import {getCurrentProject} from "../../selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../selectors/getCurrentViewMod/getCurrentViewMod";

interface fetchAwaitListProps {
    limit: number,
    offset: number,
}


export const fetchAwaitList = createAsyncThunk<order_product_list, fetchAwaitListProps, ThunkConfig<string>>(
    'eq/fetchAwaitList',
    async (params: fetchAwaitListProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const current_department = getCurrentDepartment(getState());
        const pin_code = getEmployeePinCode(getState());
        const project = getCurrentProject(getState());
        const view_mode = getCurrentViewMod(getState());

        try {
            const response = await extra.api.get<order_product_list>('/core/get_await_list/', {
                params: {
                    department_number: current_department?.number,
                    pin_code: pin_code,
                    project: project,
                    view_mode: view_mode.key,
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