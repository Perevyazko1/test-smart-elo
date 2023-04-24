import {StateSchema} from "app/providers/StoreProvider";

export const getEmployeeDepartments = (state: StateSchema) => state.employee.authData?.departments

export const getEmployeeIsBoss = (
    state: StateSchema) => {
    const groups_list = state.employee.authData?.groups
    if (groups_list?.length) {
        for (let i = 0; i < groups_list.length; i++) {
            if (groups_list[i].name === "Бригадиры") {
                return true;
            }
        }
    }
    return false;
}