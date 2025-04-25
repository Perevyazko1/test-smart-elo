import {BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import {errorApiHandler} from "@shared/api";

import {SERVER_HTTP_ADDRESS} from "../../consts";


// Переменная для хранения заголовков
let customHeaders: Record<string, string> = {};

// Функция для обновления заголовков
export const setRtkHeaders = (headers: Record<string, string>) => {
  customHeaders = headers;
};

// Функция для создания пользовательского baseQuery
const customFetchBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery(
        {
            baseUrl: SERVER_HTTP_ADDRESS + '/api/v1',
            prepareHeaders: (headers) => {
                // Добавляем заголовки из customHeaders
                Object.entries(customHeaders).forEach(([key, value]) => {
                  headers.set(key, value);
                });
                return headers;
            },
            // headers: {
            //     'Authorization': `Token ${token}`,
            //     // 'Content-Type': 'application/json',
            // }
        });

    try {
        // Выполняем запрос и возвращаем результат
        const result = await baseQuery(args, api, extraOptions);
        return result;
    } catch (error) {
        // Обработка ошибки
        errorApiHandler(error);
        // Возвращаем объект ошибки в соответствии с ожидаемым типом
        return {error: {status: 'CUSTOM_ERROR', error: String(error)}};
    }
};

export const rtkAPI = createApi({
    reducerPath: 'rtkAPI',
    baseQuery: customFetchBaseQuery,
    tagTypes: [
        'RetarifficationCard',
        'WagesList',
        'PlanInfo',
        'UserList',
        'StaffInfo',
        'WagesWeekInfo',
        'Transaction',
        'AssignmentInfo',
        'TaskComments',
        'TarifficationComments',
    ],
    endpoints: () => ({}),
    keepUnusedDataFor: 0,
})
