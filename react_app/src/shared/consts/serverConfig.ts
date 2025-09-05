const isDevelopment = process.env.NODE_ENV === 'development';

export const STATIC_URL = isDevelopment ? `http://${window.location.hostname}` : `https://elo.szmk.pro`;
export const SALARY_URL = isDevelopment ? `http://localhost:5173` : `https://salary.szmk.pro`;
export const SERVER_HTTP_ADDRESS = isDevelopment ? `http://${window.location.hostname}:8000` : `https://elo.szmk.pro`
export const SERVER_WS_ADDRESS = isDevelopment ? `ws://${window.location.hostname}:8000` : `wss://elo.szmk.pro`
