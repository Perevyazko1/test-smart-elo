import {useState, useCallback} from 'react';

const useQueue = () => {
    const [queue, setQueue] = useState<number[]>([]);

    const addToQueue = useCallback((item: number) => {
        setQueue((prevQueue) => [...prevQueue, item]);
    }, []);

    const processNext = useCallback(() => {
        setQueue((prevQueue) => {
            const [first, ...rest] = prevQueue;
            if (first !== undefined) {
                // Обработка элемента
                console.log('Processing:', first);
            }
            return rest;
        });
    }, []);

    return {queue, addToQueue, processNext};
};

export default useQueue;
