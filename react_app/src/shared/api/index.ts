import axios from "axios";
import {API_URL, USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";


export const $axios = axios.create({
    baseURL: API_URL + '/api/v1'
});

$axios.interceptors.request.use(config => {
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
});
