import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {SERVER_HTTP_ADDRESS} from "../const/server_config";


export const rtkAPI = createApi({
    reducerPath: 'rtkAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: SERVER_HTTP_ADDRESS + '/api/v1',
    }),
    endpoints: () => ({}),
    keepUnusedDataFor: 0,
})