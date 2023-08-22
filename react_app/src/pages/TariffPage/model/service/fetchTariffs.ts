import {createAsyncThunk} from "@reduxjs/toolkit";

import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {AppRoutes} from "app/providers/Router";
import {getEmployeePinCode} from "entities/Employee";

import {TariffPageCardList} from "../types/types";

interface fetchTariffsProps {
    limit: number,
    offset: number,
    isNext: boolean,
}


export const fetchTariffs = createAsyncThunk<TariffPageCardList, fetchTariffsProps, ThunkConfig<string>>(
    'tariff/fetchTariffs',
    async (params: fetchTariffsProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;
        const pin_code = getEmployeePinCode(getState())

        try {
            const response = await extra.api.get<TariffPageCardList>(`core/${AppRoutes.TARIFFS}`, {
                params: {
                    ...params,
                    pin_code: pin_code,
                },
            });
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