import {Dispatch} from "@reduxjs/toolkit";
import {eqActions} from "pages/EQPage";

import {SERVER_WS_ADDRESS} from "../const/server_config";


const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 5000;

type WsMessageData = {
    action: 'update_eq_lists' | 'update_target_item';
    data: any;
    lists: ['await' | 'in_work' | 'ready' | ''];
}

type WsMessage = {
    initiator: number;
    data: WsMessageData;
}

export const newWsConnection = (pin_code: number, department_number: number, dispatch: Dispatch) => {
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
        socket = new WebSocket(`${SERVER_WS_ADDRESS}/ws/${pin_code}/${department_number}/`);

        socket.onopen = () => {
            console.log('WS connected');
            reconnectAttempts = 0;
        };

        socket.onclose = (event) => {
            if (event.wasClean) {
                console.log('WS closed');

            } else {
                console.log('Соединение потерянно, попытка восстановить...');
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(connect, RECONNECT_INTERVAL_MS);
                    reconnectAttempts++;
                } else {
                    console.error('Превышено количество попыток восстановления соединения: ', MAX_RECONNECT_ATTEMPTS);
                }
            }
        };

        socket.onmessage = (event) => {
            const data: WsMessage = JSON.parse(event.data)

            if (data.data.action === 'update_eq_lists' && data.initiator !== pin_code) {
                data.data.lists.forEach((list_name: string) => {
                    switch (list_name) {
                        case 'await':
                            // TODO сделать обновления
                            // dispatch(eqActions.awaitListUpdated())
                            return;
                        case 'in_work':
                            // dispatch(eqActions.inWorkListUpdated())
                            return;
                        case 'ready':
                            // dispatch(eqActions.readyListUpdated())
                            return;
                        default:
                            console.error('Неопознанная команда для обновления списков')
                            return;
                    }
                });
            }

            if (data.data.action === 'update_target_item' && data.initiator !== pin_code) {
                data.data.lists.forEach((list_name: string) => {
                    switch (list_name) {
                        case 'await':
                            console.log(data.data.data, list_name)
                            return;
                        case 'in_work':
                            console.log(data.data.data, list_name)
                            return;
                        case 'ready':
                            console.log(data.data.data, list_name)
                            return;
                        default:
                            console.error('Неопознанная команда для обновления списков')
                            return;
                    }
                });
            }

        }
    }
    connect();
    return socket;
}
