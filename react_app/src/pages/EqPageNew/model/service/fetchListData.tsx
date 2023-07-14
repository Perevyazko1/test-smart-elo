import {createAsyncThunk} from "@reduxjs/toolkit";

import {eq_page_list} from "entities/EqPageCard";
import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";

import {getEqProjectFilter} from "../selectors/apiSelectors/apiSelectors";

interface fetchListDataProps {
    target_list: 'await' | 'in_work' | 'ready' | 'mobile',
    limit?: number,
    offset?: number,
    url?: string,
}


export const fetchListData = createAsyncThunk<eq_page_list, fetchListDataProps, ThunkConfig<string>>(
    'eq/fetchListData',
    async (params: fetchListDataProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());
        const {url, ...props} = params;

        try {
            let response

            if (url) {
                response = await extra.api.get<eq_page_list>(url);
            } else {
                response = await extra.api.get<eq_page_list>('/core/get_eq_cards/', {
                    params: {
                        ...filters,
                        ...props,
                    }
                });
            }
            if (response.data) {
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)