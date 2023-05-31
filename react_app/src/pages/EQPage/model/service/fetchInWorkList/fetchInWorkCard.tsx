import {createAsyncThunk} from "@reduxjs/toolkit";
import {order_product} from "entities/OrderProduct";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getCurrentDepartment, getEmployeePinCode} from "entities/Employee";
import {getCurrentProject} from "../../selectors/getCurrentProject/getCurrentProject";
import {getCurrentViewMod} from "../../selectors/getCurrentViewMod/getCurrentViewMod";

interface fetchInWorkCardProps {
    id: number,
}


export const fetchInWorkCard = createAsyncThunk<order_product, fetchInWorkCardProps, ThunkConfig<string>>(
    'eq/fetchInWorkCard',
    async (params: fetchInWorkCardProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const current_department = getCurrentDepartment(getState());
        const pin_code = getEmployeePinCode(getState());
        const project = getCurrentProject(getState());
        const view_mode = getCurrentViewMod(getState());

        try {
            const target_url = `/core/get_in_work_list/${params.id}/`
            const response = await extra.api.get<order_product>(target_url, {
                params: {
                    department_number: current_department?.number,
                    pin_code: pin_code,
                    project: project,
                    view_mode: view_mode.key,
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