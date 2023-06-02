import {createAsyncThunk} from "@reduxjs/toolkit";
import {ThunkConfig} from "app/providers/StoreProvider";
import {getEmployeePinCode} from "entities/Employee";

import {TaxControlList} from "../../types/TaxControlSchema";
import {getTCCurrentViewMode} from "../../selectors/getTCCurrentViewMode/getTCCurrentViewMode";
import {getTCDepartmentFilter} from "../../selectors/getTCDepartmentFilter/getTCDepartmentFilter";
import {getTCProductNameFilter} from "../../selectors/getTCProductNameFilter/getTCProductNameFilter";


interface fetchTaxControlProps {
    limit: number,
    offset: number,
}

export const fetchTaxControlList = createAsyncThunk<TaxControlList, fetchTaxControlProps, ThunkConfig<string>>(
    'eq/fetchTaxControlList',
    async (params: fetchTaxControlProps, thunkAPI) => {

        const {extra, getState} = thunkAPI;

        const current_view_mode = getTCCurrentViewMode(getState())
        const current_department = getTCDepartmentFilter(getState())
        const pin_code = getEmployeePinCode(getState())
        const current_product_name_filter = getTCProductNameFilter(getState())

        try {
            const response = await extra.api.get<TaxControlList>('/core/get_production_steps/', {
                params: {
                    department_number: current_department?.number,
                    view_mode: current_view_mode,
                    product_name: current_product_name_filter || '',
                    pin_code: pin_code,
                    limit: params.limit,
                    offset: params.offset,
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