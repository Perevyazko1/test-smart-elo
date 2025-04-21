export const API_TOKEN = 'Bearer 462749a3798091fcbf9840aade46dfeef628b5df';
export const URL_MS = '/api/ms';

export const GET_AUTH = {
    'Authorization': API_TOKEN,
    // 'Accept-Encoding': 'gzip',
}

export const CONT_TYPE = {'Content-Type': 'application/json'}

export const POST_AUTH = {...GET_AUTH, ...CONT_TYPE}