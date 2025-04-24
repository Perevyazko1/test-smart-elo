import {Employee} from "../types/employee";
import {APP_PERM} from "@shared/consts";

export const anonEmployee: Employee = {
    id: 0,
    groups: [
        {name: APP_PERM.ANON},
    ],
    username: 'anon_user',
    attention: false,
    is_active: false,
    first_name: 'Anon',
    last_name: 'User',
    description: 'anon_user',
    pin_code: 123456,
    current_department: {
        id: 0,
        name: 'СЗМК',
        number: 0,
        ordering: 0,
        color: '',
        piecework_wages: false,
        single: false,
    },
    permanent_department: {
        id: 0,
        name: 'СЗМК',
        number: 0,
        ordering: 0,
        color: '',
        piecework_wages: false,
        single: false,
    },
    departments: [{
        id: 0,
        name: 'СЗМК',
        number: 0,
        ordering: 0,
        color: '',
        piecework_wages: false,
        single: false,
    }],
    current_balance: '0',
    token: 'test_token',
    patronymic: null,
    boss: null,
    favorite_users: [],
    piecework_wages: false,
}