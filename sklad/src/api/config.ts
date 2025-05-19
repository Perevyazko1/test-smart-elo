// Тест токен
// export const API_TOKEN = 'Bearer 462749a3798091fcbf9840aade46dfeef628b5df';

// Основной токен
export const API_TOKEN = 'Bearer b6cbd1444a9cf14ee0c03efa27933a6c9cbbed14';
export const URL_MS = '/api/ms';

export const GET_AUTH = {
    'Authorization': API_TOKEN,
    // 'Accept-Encoding': 'gzip',
}

export const INVENT_ATTRIBUTE_NAME = "Инвентаризирован"
export const STORE_NAME = "К.Тракт фабрика"
export const ORGANISATION_NAME = 'ООО "СЗМК"'

export const CONT_TYPE = {'Content-Type': 'application/json'}

export const POST_AUTH = {...GET_AUTH, ...CONT_TYPE}