import { useCallback, useRef, useEffect } from 'react';

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const argsRef = useRef<any[]>();
    const timer = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback((...args: any[]) => {
        argsRef.current = args;

        if (timer.current) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
            if (argsRef.current) {
                callback(...argsRef.current);
            }
        }, delay);
    }, [callback, delay]);

    useEffect(() => {
        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    return debouncedCallback;
}