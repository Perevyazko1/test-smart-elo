import {StateSchema} from "../../../app/providers/StoreProvider";
import {EmployeePermissions} from "entities/Employee";

export const getEmployeeHasPermissions = (state: StateSchema, permissions: EmployeePermissions[]) => {
    const user_groups = state.employee.authData?.groups || [];

    permissions?.forEach((permission) => {
        if (!(permission in user_groups)) {
            return false
        }
    })

    return true
}