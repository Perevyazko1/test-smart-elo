import * as process from "process";

export const SERVER_HOST = `http://${window.location.hostname}`;
export const WS_HOST = `ws://${window.location.hostname}`;
export const SERVER_PORT = '8000';

export const GET_STATIC_URL = () => {
    if (process.env.REACT_APP_DEV_MODE === "true") {
        return `${SERVER_HOST}:${SERVER_PORT}`
    }
    return `http://${window.location.hostname}`
}

export const SERVER_HTTP_ADDRESS = `${SERVER_HOST}:${SERVER_PORT}`
export const SERVER_WS_ADDRESS = `${WS_HOST}:${SERVER_PORT}`