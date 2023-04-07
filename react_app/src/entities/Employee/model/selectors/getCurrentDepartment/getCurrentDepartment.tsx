import {StateSchema} from "app/providers/StoreProvider";

export const getCurrentDepartment = (state: StateSchema) => state.employee.authData?.current_department