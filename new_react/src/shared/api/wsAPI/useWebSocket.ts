import {useCallback, useEffect, useRef, useState} from "react";

import {SERVER_WS_ADDRESS} from "@shared/consts";
import {useAppDispatch, useCurrentUser, useNotification} from "@shared/hooks";
import {eqPageActions} from "@pages/EqPage";
import {taskPageActions} from "@pages/TaskPage";
import {appNavbarActions} from "@widgets/AppNavbar";


const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 5000;

export const useWebSocket = () => {
    const {currentUser} = useCurrentUser();
    const {showNotification} = useNotification();
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const dispatch = useAppDispatch();
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        socketRef.current = new WebSocket(
            `${SERVER_WS_ADDRESS}/ws/${currentUser.pin_code}/${currentUser.current_department?.number || 0}/`
        );

        socketRef.current.onopen = () => {
            setReconnectAttempts(0);
        };

        socketRef.current.onclose = (event) => {
            if (!event.wasClean) {
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(connect, RECONNECT_INTERVAL_MS);
                    setReconnectAttempts(reconnectAttempts + 1);
                } else {
                    alert("Соединение с сервером потеряно, перезагрузите страницу.");
                    window.location.reload();
                }
            }
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleSocketMessage(data);
        };
        // eslint-disable-next-line
    }, [currentUser.pin_code, currentUser.current_department]);

    const handleSocketMessage = (data: any) => {
        if (data.data?.action === 'update_target_item' && data.initiator !== currentUser.pin_code) {
            dispatch(eqPageActions.addNotRelevantId(data.data.data));
        }

        if (data.data?.action === 'update_notification') {
            dispatch(appNavbarActions.listHasUpdated());
        }

        if (data.action === 'UPDATE_TASK') {
            if (data.exclude !== currentUser.pin_code) {
                dispatch(taskPageActions.addNoRelevantId(data.data));
            }
        }

        if (data.action === 'WEEK_INFO_UPDATED') {
            dispatch(eqPageActions.weekDataHasUpdated());
        }

        if (data.action === 'NEW_NOTIFICATION') {
            if (data.for_user === currentUser.pin_code || !data.for_user) {
                showNotification(data.title, {
                        data: {
                            url: data.url,
                        },
                        actions: [
                            {
                                action: "open",
                                title: "Просмотреть",
                            },
                            {
                                action: "dismiss",
                                title: "Закрыть",
                            },
                        ],
                        body: data.body,
                        tag: data.tag,
                    }
                );
            }
        }
    };

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        // Далее проверка не анонимный ли пользователь
        if (currentUser.current_department && currentUser.current_department.number !== 0) {
            connect();
        }
        return () => {
            socketRef.current?.close();
        };
    }, [connect, currentUser.current_department]);

    return socketRef.current;
}