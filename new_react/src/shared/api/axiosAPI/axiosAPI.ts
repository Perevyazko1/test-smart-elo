import axios from "axios";

import {SERVER_HTTP_ADDRESS, USER_LOCALSTORAGE_TOKEN} from "../../consts";


export const $axiosAPI = axios.create({
    baseURL: SERVER_HTTP_ADDRESS + '/api/v1'
})

$axiosAPI.interceptors.request.use(config => {
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
});