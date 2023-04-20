export const SERVER_HOST = `http://${window.location.hostname}` || 'http://localhost';
export const WS_HOST = `ws://${window.location.hostname}` || 'ws://localhost';
export const SERVER_PORT = '8000';

export const SERVER_HTTP_ADDRESS = `${SERVER_HOST}:${SERVER_PORT}`
export const SERVER_WS_ADDRESS = `${WS_HOST}:${SERVER_PORT}`