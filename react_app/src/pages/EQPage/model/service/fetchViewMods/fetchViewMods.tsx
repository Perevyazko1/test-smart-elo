import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

import {SERVER_HTTP_ADDRESS} from "shared/const/server_config";

import {eqActions} from "../../slice/eqSlice";
import {ViewMode} from "../../types/eqSchema";

interface fetchViewModsListProps {
}

export const fetchViewModsList = createAsyncThunk<ViewMode[], fetchViewModsListProps, {rejectValue: string}>(
    'eq/fetchViewModsList',
    async (filters: fetchViewModsListProps, thunkAPI) => {
        try {
            const response = await axios.get(`${SERVER_HTTP_ADDRESS}/api/v1/core/get_view_modes/`, {
                params: {...filters}
            });
            if (response.data) {
                thunkAPI.dispatch(eqActions.setViewMods(response.data.view_modes))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            // TODO написать обработку ошибок на различные статус коды ответа сервера
            console.log(e)
            return thunkAPI.rejectWithValue('Ошибка запроса')
        }
    }
)