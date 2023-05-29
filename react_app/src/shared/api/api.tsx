import axios from "axios";
import {SERVER_HTTP_ADDRESS} from "../const/server_config";

export const $api = axios.create({
    baseURL: SERVER_HTTP_ADDRESS + '/api/v1',
})