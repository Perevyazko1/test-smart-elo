import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";
import {order_product_list} from "entities/OrderProduct";
import {auditWidgetActions} from "../slice/auditWidgetSlice";


interface fetchAuditListProps {
    pin_code: number,
}

export const fetchAuditList = createAsyncThunk<order_product_list, fetchAuditListProps, {rejectValue: string}>(
    'eq/fetchAuditList',
    async (filters: fetchAuditListProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/staff/get_audit_list/`, {
                params: {...filters}
            });
            if (response.data.data) {
                thunkAPI.dispatch(auditWidgetActions.setAuditWidgetData(response.data.data))
                return response.data.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)