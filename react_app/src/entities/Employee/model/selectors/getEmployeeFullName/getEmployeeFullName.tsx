import {StateSchema} from "app/providers/StoreProvider";

export const getEmployeeFullName = (state: StateSchema) => {
    if (state.employee.authData?.first_name && state.employee.authData.last_name) {
        return `${state.employee.authData?.first_name} ${state.employee.authData?.last_name} `
    }
    return undefined
}