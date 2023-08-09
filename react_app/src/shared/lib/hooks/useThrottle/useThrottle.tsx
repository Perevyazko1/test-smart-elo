import { useRef, useCallback } from 'react';

export function useThrottle(callback: (...args: any[]) => void, delay: number) {
    const lastRun = useRef<number>(0);
    const argsRef = useRef<any[]>();
    const timer = useRef<NodeJS.Timeout | null>(null);

    const throttledCallback = useCallback((...args: any[]) => {
        argsRef.current = args;
        const now = Date.now();

        const nextRun = lastRun.current + delay - now;

        if (nextRun <= 0) {
            callback(...args);
            lastRun.current = now;
        } else if (!timer.current) {
            timer.current = setTimeout(() => {
                if (argsRef.current) {
                    callback(...argsRef.current);
                    lastRun.current = Date.now();
                }
                timer.current = null;
            }, nextRun);
        }
    }, [callback, delay]);

    return throttledCallback;
}
