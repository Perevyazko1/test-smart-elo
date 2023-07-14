import {createAsyncThunk} from "@reduxjs/toolkit";

import {employee, employeeActions} from "entities/Employee";
import {ThunkConfig} from "app/providers/StoreProvider";
import {handleErrors} from "shared/api/handleErrors";
import {getEqProjectFilter} from "../selectors/apiSelectors/apiSelectors";

interface fetchCurrentDepartmentProps {
    department_number: number,
}

export const fetchCurrentDepartment = createAsyncThunk<employee, fetchCurrentDepartmentProps, ThunkConfig<string>>(
    'eq/fetchCurrentDepartment',
    async (props: fetchCurrentDepartmentProps, thunkAPI) => {
        const {extra, getState} = thunkAPI;

        const filters = getEqProjectFilter(getState());

        try {
            const response = await extra.api.post('/staff/change_current_department/', {
                ...filters,
                ...props,
            });
            if (response.data) {
                thunkAPI.dispatch(employeeActions.setEmployee(response.data))
                return response.data;
            } else {
                throw new Error();
            }
        } catch (e) {
            return handleErrors(e, thunkAPI)
        }
    }
)