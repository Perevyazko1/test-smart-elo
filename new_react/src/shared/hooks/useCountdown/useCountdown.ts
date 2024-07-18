import { useState, useEffect } from 'react';

interface TimeLeft {
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface UseCountdownOptions {
    targetDate: string | undefined;
    startDate?: string | undefined;
}

export const useCountdown = ({ targetDate, startDate }: UseCountdownOptions): TimeLeft | undefined => {
    const calculateTimeLeft = (): TimeLeft | undefined => {
        if (!targetDate) {
            return undefined;
        }
        const start = startDate ? new Date(startDate).getTime() : new Date().getTime();
        const difference = +new Date(targetDate) - start;

        return {
            weeks: Math.trunc(difference / (1000 * 60 * 60 * 24 * 7)),
            days: Math.trunc((difference / (1000 * 60 * 60 * 24)) % 7),
            hours: Math.trunc((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.trunc((difference / 1000 / 60) % 60),
            seconds: Math.trunc((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft | undefined>(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
        //eslint-disable-next-line
    }, [timeLeft, targetDate, startDate]);

    return timeLeft;
}
