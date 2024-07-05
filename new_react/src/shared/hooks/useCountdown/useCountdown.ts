import {useState, useEffect} from 'react';

interface TimeLeft {
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const useCountdown = (targetDate: string | undefined): TimeLeft | undefined => {
    const calculateTimeLeft = (): TimeLeft | undefined => {
        if (!targetDate) {
            return undefined;
        }
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: TimeLeft = {weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0};

        if (difference > 0) {
            timeLeft = {
                weeks: Math.floor(difference / (1000 * 60 * 60 * 24 * 7)),
                days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 7),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft | undefined>(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
        //eslint-disable-next-line
    }, [timeLeft, targetDate]);

    return timeLeft;
}
