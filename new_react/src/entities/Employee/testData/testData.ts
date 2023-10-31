import {Employee} from "../types/employee";
import {APP_PERMISSIONS} from "@shared/consts";

export const testEmployee: Employee = {
    id: 0,
    groups: [
        {name: APP_PERMISSIONS.ELO_PAGE},
        {name: APP_PERMISSIONS.ADMIN},
    ],
    username: 'test_user',
    first_name: 'Артем',
    last_name: 'Борисенко',
    pin_code: 123456,
    current_department: 0,
    departments: [0],
    current_balance: '0',
    token: 'test_token',
}