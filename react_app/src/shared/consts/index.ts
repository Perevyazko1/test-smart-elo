export const IS_DEV_MODE = import.meta.env.MODE === 'development';
export const API_URL =
    IS_DEV_MODE ? "http://localhost:8000" :
        import.meta.env.VITE_API_URL || "https://elo.szmk.pro";
export const USER_LOCALSTORAGE_TOKEN = 'USER_LOCALSTORAGE_TOKEN';

export const SALARY_STATUSES = {
    '1': 'Начисление',
    '2': 'Виза',
    '3': 'Бюджет',
    '4': 'К выплате',
    '5': 'Выплата',
    '6': 'Закрыта',
};