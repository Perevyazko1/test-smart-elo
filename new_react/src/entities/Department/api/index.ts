import {rtkAPI} from "@shared/api";

import {Department} from "../types/department";


const TaskFormApi = rtkAPI.injectEndpoints({
        endpoints: (build) => ({
            getDepartmentList: build.query<Department[], {}>({
                query: () => ({
                    url: '/staff/departments/',
                }),
                keepUnusedDataFor: 6000,
            }),
        }),
    })
;

export const useDepartmentList = TaskFormApi.useGetDepartmentListQuery;
