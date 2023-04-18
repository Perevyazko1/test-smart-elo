import {StateSchema} from "app/providers/StoreProvider";

export const getEmployeePinCode = (state: StateSchema) => state.employee.authData?.pin_code