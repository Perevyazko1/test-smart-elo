import React, {useEffect, useState} from "react";
import {useCurrentUser} from "@shared/hooks";
import {anonEmployee} from "@entities/Employee";
import { throttle } from 'lodash';

export const AutoLogout = () => {
    const [countdown, setCountdown] = useState<number>(0);
    const {setCurrentUser} = useCurrentUser();
    const APP_COUNTDOWN_SEC = 60;

    const resetTimers = () => {
        setCountdown(APP_COUNTDOWN_SEC);
    };

    const throttledReset = throttle(resetTimers, 1000);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else {
            setCurrentUser(anonEmployee);
        }

        return () => clearInterval(interval);
    }, [countdown, setCurrentUser]);

    useEffect(() => {
        // Установка обработчиков событий
        window.addEventListener('mousemove', throttledReset);
        window.addEventListener('keydown', throttledReset);
        window.addEventListener('click', throttledReset);

        // Сброс таймеров при размонтировании компонента
        return () => {
            window.removeEventListener('mousemove', throttledReset);
            window.removeEventListener('keydown', throttledReset);
            window.removeEventListener('click', throttledReset);
        };
        // eslint-disable-next-line
    }, []);

    return (
        <div className={'position-absolute text-light fw-bold'} style={{top: '12px', left: '12px'}}>
            {countdown}
        </div>
    );
};
