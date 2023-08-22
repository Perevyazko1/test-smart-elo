import {createAsyncThunk} from "@reduxjs/toolkit";

import {getEmployeePinCode} from "entities/Employee";
import {handleErrors} from "shared/api/handleErrors";
import {ThunkConfig} from "app/providers/StoreProvider";
import {Tariff, TariffPageCard} from "../types/types";

interface updateTariffProps {
    tariffData: Tariff,
    productionStepId: number,
}


export const updateTariff = createAsyncThunk<TariffPageCard, updateTariffProps, ThunkConfig<string>>(
    'tariff/updateTariff',
    async (params: updateTariffProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;
        const pin_code = getEmployeePinCode(getState());

        try {
            let tariffResponse;

            if (params.tariffData.id) {
                tariffResponse = await extra.api.put<Tariff>(
                    `core/tariffs/${params.tariffData.id}/`,
                    params.tariffData
                );
            } else {
                tariffResponse = await extra.api.post<Tariff>(
                    `core/tariffs/`,
                    {...params.tariffData}
                );
            }

            const stepResponse = await extra.api.patch<TariffPageCard>(
                `core/tariff_cards/${params.productionStepId}/`,
                {
                    production_step_tariff_id: tariffResponse.data.id,
                },
                {
                    params: {
                        pin_code: Number(pin_code),
                    }
                }
            );

            if (stepResponse.data) {
                return stepResponse.data;
            } else {
                throw new Error();
            }
        } catch
            (e: any) {
            return handleErrors(e, thunkAPI);
        }
    }
)