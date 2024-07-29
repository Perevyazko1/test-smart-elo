import {useState, useCallback} from 'react';

export const useQueue = () => {
    const [queue, setQueue] = useState<number[]>([]);

    const addToQueue = useCallback((item: number) => {
        setQueue((prevQueue) => [...prevQueue, item]);
    }, []);

    const processNext = useCallback(() => {
        setQueue((prevQueue) => {
            const [first, ...rest] = prevQueue;
            if (first !== undefined) {
            }
            return rest;
        });
    }, []);

    return {queue, addToQueue, processNext};
};
