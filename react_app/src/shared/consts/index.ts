export const IS_DEV_MODE = import.meta.env.MODE === 'development';
export const API_URL =
    IS_DEV_MODE ? "http://localhost:8000" :
        import.meta.env.VITE_API_URL || "https://elo.szmk.pro";
export const USER_LOCALSTORAGE_TOKEN = 'USER_LOCALSTORAGE_TOKEN';

export const SALARY_STATUSES = {
    '0': 'Создана',
    '1': 'Внесение зарплаты',
    '2': 'Визирование',
    '3': 'Согласование бюджета',
    '4': 'Согласование выплат',
    '5': 'Выплата',
    '6': 'Закрыта',
};