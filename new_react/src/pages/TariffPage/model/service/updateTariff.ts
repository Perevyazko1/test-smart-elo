import {createAsyncThunk} from "@reduxjs/toolkit";

import {Tariff, TariffPageCard} from "../types/types";
import {ThunkConfig} from "@app";
import {errorApiHandler} from "@shared/api";

interface updateTariffProps {
    tariffData: Tariff,
    productionStepId: number,
}


export const updateTariff = createAsyncThunk<TariffPageCard, updateTariffProps, ThunkConfig<string>>(
    'tariff/updateTariff',
    async (params: updateTariffProps, thunkAPI) => {
        const {extra} = thunkAPI;

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
            );

            if (stepResponse.data) {
                return stepResponse.data;
            } else {
                throw new Error();
            }
        } catch
            (e: any) {
            errorApiHandler(e);
            return thunkAPI.rejectWithValue('Ошибка связи с сервером');
        }
    }
)