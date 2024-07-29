import React, {useEffect} from 'react';
import useQueue from '../model/lib';

interface ChildComponentProps {
    items: number[];
}

const ChildComponent: React.FC<ChildComponentProps> = ({items}) => {
    const {queue, addToQueue, processNext} = useQueue();

    useEffect(() => {
        if (items.length > 0) {
            const newItem = items[items.length - 1];
            addToQueue(newItem);
        }
    }, [items, addToQueue]);

    return (
        <div>
            <h3>Queue: {queue.join(', ')}</h3>
            <button onClick={processNext}>Process Next</button>
        </div>
    );
};

export default ChildComponent;
