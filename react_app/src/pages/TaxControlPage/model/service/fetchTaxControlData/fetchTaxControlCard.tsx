import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "app/providers/StoreProvider";
import {getEmployeePinCode} from "entities/Employee";

import {TaxControlData} from "../../types/TaxControlSchema";
import {getTCCurrentViewMode} from "../../selectors/getTCCurrentViewMode/getTCCurrentViewMode";
import {getTCDepartmentFilter} from "../../selectors/getTCDepartmentFilter/getTCDepartmentFilter";
import {getTCProductNameFilter} from "../../selectors/getTCProductNameFilter/getTCProductNameFilter";


interface fetchTaxControlCardProps {
    id: number,
}

export const fetchTaxControlCard = createAsyncThunk<TaxControlData, fetchTaxControlCardProps, ThunkConfig<string>>(
    'taxControl/fetchTaxControlCard',
    async (params: fetchTaxControlCardProps, thunkAPI) => {

        const {extra, getState} = thunkAPI;

        const current_view_mode = getTCCurrentViewMode(getState())
        const current_department = getTCDepartmentFilter(getState())
        const pin_code = getEmployeePinCode(getState())
        const current_product_name_filter = getTCProductNameFilter(getState())

        try {
            const response = await extra.api.get<TaxControlData>(`/core/get_production_steps/${params.id}`, {
                params: {
                    department_number: current_department?.number,
                    view_mode: current_view_mode,
                    product_name: current_product_name_filter || '',
                    pin_code: pin_code,
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