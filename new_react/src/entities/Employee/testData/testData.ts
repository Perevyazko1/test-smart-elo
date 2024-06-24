import {Employee} from "../types/employee";
import {APP_PERM} from "@shared/consts";

export const anonEmployee: Employee = {
    id: 0,
    groups: [
        {name: APP_PERM.ANON},
    ],
    username: 'anon_user',
    first_name: 'Anon',
    last_name: 'User',
    pin_code: 123456,
    current_department: {
        id: 0,
        name: 'СЗМК',
        number: 0,
        color: '',
        piecework_wages: false,
        single: false,
    },
    departments: [{
        id: 0,
        name: 'СЗМК',
        number: 0,
        color: '',
        piecework_wages: false,
        single: false,
    }],
    current_balance: '0',
    token: 'test_token',
    patronymic: null,
}