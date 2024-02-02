import {useCallback, useEffect, useRef, useState} from "react";


interface Position {
    x: number;
    y: number;
}


export const useDraggable = (initialPos: Position) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [position, setPosition] = useState<Position>({x: 0, y: 0});
    const [elementCoord, setElementCoord] = useState<Position>(initialPos);


    const handleStart = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        const target = ref.current;
        if (target) {
            const rect = target.getBoundingClientRect();
            setPosition({
                x: ('touches' in event) ? event.touches[0].clientX - rect.left + 1 : event.clientX - rect.left,
                y: ('touches' in event) ? event.touches[0].clientY - rect.top + 2 : event.clientY - rect.top,
            });
            setIsDragging(true);
        }
    }, []);

    const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (isDragging) {
            const target = ref.current;
            if (target) {
                const newX = ('touches' in event) ? event.touches[0].clientX - position.x : event.clientX - position.x;
                const newY = ('touches' in event) ? event.touches[0].clientY - position.y : event.clientY - position.y;
                setElementCoord({x: newX, y: newY})
                // target.style.transform = `translate(${newX}px, ${newY}px)`;
            }
        }
    }, [isDragging, position]);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (element) {
            element.addEventListener('mousedown', handleStart);
            element.addEventListener('touchstart', handleStart);

            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);

            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
            window.addEventListener('mouseleave', handleEnd);
            window.addEventListener('touchcancel', handleEnd);

            return () => {
                element.removeEventListener('mousedown', handleStart);
                element.removeEventListener('touchstart', handleStart);

                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('touchmove', handleMove);

                window.removeEventListener('mouseup', handleEnd);
                window.removeEventListener('touchend', handleEnd);
                window.removeEventListener('mouseleave', handleEnd);
                window.removeEventListener('touchcancel', handleEnd);
            };
        }
    }, [handleStart, handleMove, handleEnd]);

    return {isDragging, ref, elementCoord};
}