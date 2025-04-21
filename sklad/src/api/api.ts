import axios, {CreateAxiosDefaults} from "axios";
import {GET_AUTH, URL_MS} from "@/api/config";


const options: CreateAxiosDefaults = {
    baseURL: URL_MS,
    headers: GET_AUTH,
    withCredentials: true,
}

export const $API = axios.create(options);
