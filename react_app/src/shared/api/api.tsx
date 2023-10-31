import axios from "axios";
import {SERVER_HTTP_ADDRESS} from "../const/server_config";
import {USER_LOCALSTORAGE_TOKEN} from "../const/localstorage";


export const $api = axios.create({
    baseURL: SERVER_HTTP_ADDRESS + '/api/v1'
})

$api.interceptors.request.use(config => {
    const token = localStorage.getItem(USER_LOCALSTORAGE_TOKEN);
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
});