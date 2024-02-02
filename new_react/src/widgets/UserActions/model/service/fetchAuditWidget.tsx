import {createAsyncThunk} from "@reduxjs/toolkit";

import {ThunkConfig} from "@app";
import {SERVER_HTTP_ADDRESS} from "@shared/consts";

import {auditWidgetActions} from "../slice/auditWidgetSlice";
import {AuditWidgetData} from "../type/AuditWidgetSchema";


interface fetchAuditListProps {
}

export const fetchAuditList = createAsyncThunk<AuditWidgetData, fetchAuditListProps, ThunkConfig<string>>(
    'eq/fetchAuditList',
    async (filters: fetchAuditListProps, thunkAPI) => {
        const {extra} = thunkAPI;

        try {
            const response = await extra.api.get(`${SERVER_HTTP_ADDRESS}/api/v1/staff/get_audit_list/`, {
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