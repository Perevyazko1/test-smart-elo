import {BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import {errorApiHandler} from "@shared/api";

import {SERVER_HTTP_ADDRESS, USER_LOCALSTORAGE_TOKEN} from "../../consts";

// Получение токена из localStorage
const getToken = () => {
    return localStorage.getItem(USER_LOCALSTORAGE_TOKEN);
}

// Функция для создания пользовательского baseQuery
const customFetchBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const token = getToken();
    const baseQuery = fetchBaseQuery(
        {
            baseUrl: SERVER_HTTP_ADDRESS + '/api/v1',
            headers: {
                'Authorization': `Token ${token}`
            }
        });

    try {
        // Выполняем запрос и возвращаем результат
        const result = await baseQuery(args, api, extraOptions);
        return result;
    } catch (error) {
        // Обработка ошибки
        errorApiHandler(error);
        // Возвращаем объект ошибки в соответствии с ожидаемым типом
        return { error: { status: 'CUSTOM_ERROR', error: String(error) }};
    }
};

export const rtkAPI = createApi({
    reducerPath: 'rtkAPI',
    baseQuery: customFetchBaseQuery,
    tagTypes: ['RetarifficationCard', 'WagesList', 'WagesWeekInfo', 'Transaction'],
    endpoints: () => ({}),
    keepUnusedDataFor: 0,
})
