import {StateSchema} from "app/providers/StoreProvider";

export const getEmployeeDepartments = (state: StateSchema) => state.employee.authData?.departments