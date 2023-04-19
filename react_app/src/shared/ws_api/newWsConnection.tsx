import {Dispatch} from "@reduxjs/toolkit";
import {eqActions} from "pages/EQPage";

import {SERVER_WS_ADDRESS} from "../const/server_config";
import {EqNotification} from "./wsTypes";


const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 5000;

export const newWsConnection = (pin_code: number, department_number: number, dispatch: Dispatch) => {
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
        socket = new WebSocket(`${SERVER_WS_ADDRESS}/ws/${pin_code}/${department_number}/`);

        socket.onopen = () => {
            console.log('WS connected');
            reconnectAttempts = 0;
        };

        socket.onclose = () => {
            console.log('WS disconnected');
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                setTimeout(connect, RECONNECT_INTERVAL_MS);
                reconnectAttempts++;
            } else {
                console.error('Превышено количество попыток восстановления соединения: ', MAX_RECONNECT_ATTEMPTS);
            }
        };

        socket.onmessage = (event) => {
            const data: EqNotification = JSON.parse(event.data)
            if (data.action === 'update_eq_lists' && data.initiator !== pin_code) {
                data.data.forEach((list_name: string) => {
                    switch (list_name) {
                        case 'await':
                            dispatch(eqActions.awaitListUpdated())
                            return;
                        case 'in_work':
                            dispatch(eqActions.inWorkListUpdated())
                            return;
                        case 'ready':
                            dispatch(eqActions.readyListUpdated())
                            return;
                        default:
                            console.error('Неопознанная команда для обновления списков')
                            return;
                    }
                })
            }
        }
    }
    connect();
}
