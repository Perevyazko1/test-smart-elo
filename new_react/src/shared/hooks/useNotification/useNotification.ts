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
        if (permission === 'granted' && options?.condition !== false) {
            new Notification(title, options);
        } else {
            // Если уведомления не разрешены или условие не соответствует, используем alert
            alert(`${title}\n${options?.body || ''}`);
        }
    }, [permission]);

    return {permission, requestPermission, showNotification};
}

