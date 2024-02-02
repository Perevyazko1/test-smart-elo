import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {SERVER_HTTP_ADDRESS} from "../../consts";


export const rtkAPI = createApi({
    reducerPath: 'rtkAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: SERVER_HTTP_ADDRESS + '/api/v1',
    }),
    tagTypes: ['RetarifficationCard', 'WagesList', 'WagesWeekInfo', 'Transaction'],
    endpoints: () => ({}),
    keepUnusedDataFor: 0,
})
