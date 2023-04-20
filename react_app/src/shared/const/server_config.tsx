export const SERVER_HOST = process.env.NGINX_SERVER_HTTP_HOST || 'http://localhost';
export const WS_HOST = process.env.NGINX_SERVER_WS_HOST || 'ws://localhost';
export const SERVER_PORT = process.env.NGINX_SERVER_PORT || '8000';

export const SERVER_HTTP_ADDRESS = `${SERVER_HOST}:${SERVER_PORT}`
export const SERVER_WS_ADDRESS = `${WS_HOST}:${SERVER_PORT}`