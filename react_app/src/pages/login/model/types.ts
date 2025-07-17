export interface IUser {
    id?: number;
    first_name: string;
    last_name: string;
    patronymic: string;
    username: string;
    departments: string;
    description: string;
    boss: string;
    current_department: number;
    permanent_department: number;
    pin_code: string;
    attention: boolean;
    is_active: boolean;
    groups: string;
    piecework_wages: boolean;
    token: string;
}