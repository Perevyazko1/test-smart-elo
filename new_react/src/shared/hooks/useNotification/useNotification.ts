import {useCallback, useEffect, useState} from 'react';

export interface ExtNotificationOptions extends NotificationOptions {
    condition?: boolean; // Дополнительное условие для показа уведомления
}

export const useNotification = () => {
    const [permission, setPermission] = useState(Notification.permission);

    const requestPermission = useCallback(async () => {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);
    }, []);

    useEffect(() => {
        if (permission === 'default') {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const showNotification = useCallback((title: string, options?: ExtNotificationOptions) => {
        // Проверяем, разрешено ли отображать уведомления
        if (permission === 'granted' && options?.condition !== false && navigator.serviceWorker) {

            navigator.serviceWorker?.ready.then(registration => {
                const swOptions = {
                        icon: '/logo192.png',
                        badge: '/logo192.png',
                        vibrate: [200, 100, 200],
                        ...options
                        // tag: 'newTask',
                        // data: {url: "/task"},
                        // actions: [
                        //     {
                        //         action: "open",
                        //         title: "Открыть",
                        //     },
                        //     {
                        //         action: "dismiss",
                        //         title: "Закрыть",
                        //     },
                        // ],
                    }
                ;
                registration.showNotification(title, swOptions)
            })

        } else {
            // Если уведомления не разрешены или условие не соответствует, используем alert
            alert(`${title}\n${options?.body || ''}`);
        }
    }, [permission]);

    return {permission, requestPermission, showNotification};
}

