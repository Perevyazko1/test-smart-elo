import {Dispatch} from "@reduxjs/toolkit";

import {eqPageActions} from "@pages/EqPage";

import {SERVER_WS_ADDRESS} from "../../consts";
import {ExtNotificationOptions} from "@shared/hooks";


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

interface newWsConnectionProps {
    pin_code: number,
    department_number: number,
    showNotification: (title: string, options?: (ExtNotificationOptions | undefined)) => void,
    dispatch: Dispatch,
}

export const newWsConnection = (props: newWsConnectionProps) => {
    const {
        pin_code,
        department_number,
        dispatch,
        showNotification
    } = props;

    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
        socket = new WebSocket(
            `${SERVER_WS_ADDRESS}/ws/${pin_code}/${department_number}/`,
        );

        socket.onopen = () => {
            // console.log('WS connected');
            reconnectAttempts = 0;
        };

        socket.onclose = (event) => {
            if (event.wasClean) {
                // console.log('WS closed');
            } else {
                console.log('Соединение потерянно, попытка восстановить...');
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(connect, RECONNECT_INTERVAL_MS);
                    reconnectAttempts++;
                } else {
                    showNotification("Соединение с сервером потеряно, перезагрузите страницу.")
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
                            showNotification("Данные обновлены.")
                            dispatch(eqPageActions.awaitUpdated())
                            return;
                        case 'in_work':
                            dispatch(eqPageActions.inWorkUpdated())
                            return;
                        case 'ready':
                            dispatch(eqPageActions.readyUpdated())
                            dispatch(eqPageActions.weekDataHasUpdated())
                            return;
                        default:
                            console.error('Неопознанная команда для обновления списков')
                            return;
                    }
                });
            }

            if (data.data.action === 'update_target_item' && data.initiator !== pin_code) {
                dispatch(eqPageActions.addNotRelevantId(data.data.data))
            }
        }
    }
    connect();
    return socket;
}
