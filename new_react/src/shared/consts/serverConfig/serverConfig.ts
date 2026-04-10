const isDevelopment = process.env.NODE_ENV === 'development';

// В проде определяем адрес по текущему хосту — работает и на elo.szmk.pro, и на IP
const prodHttp = `https://${window.location.hostname}`;
const prodWs = `wss://${window.location.hostname}`;

export const STATIC_URL = isDevelopment ? `http://${window.location.hostname}` : prodHttp;
export const SALARY_URL = isDevelopment ? `http://localhost:5173` : `https://salary.szmk.pro`;
export const SERVER_HTTP_ADDRESS = isDevelopment ? `http://${window.location.hostname}:8000` : prodHttp;
export const SERVER_WS_ADDRESS = isDevelopment ? `ws://${window.location.hostname}:8000` : prodWs;
