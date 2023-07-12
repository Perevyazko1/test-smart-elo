import {useState, useEffect} from 'react';
import {useDrag} from 'react-dnd';

const useResizableBlocks = (windowWidth: number, windowHeight: number) => {
    const [leftBlockWidth, setLeftBlockWidth] = useState(windowWidth / 2);
    const [rightBlockWidth, setRightBlockWidth] = useState(windowWidth / 2);
    const [inWorkHeight, setInWorkHeight] = useState(windowHeight / 2 - 20);
    const [readyHeight, setReadyHeight] = useState(windowHeight / 2 - 20);

    const adjustHeight = (offset_px: number) => {
        if (offset_px - 60 < 30) {
            setInWorkHeight(0);
            setReadyHeight(windowHeight - 40);
        } else if (offset_px > windowHeight) {
            setInWorkHeight(windowHeight - 40);
            setReadyHeight(0);
        } else {
            setInWorkHeight(offset_px - 60);
            setReadyHeight(windowHeight - offset_px + 20);
        }
    };

    const adjustWidth = (offset_px: number) => {
        if (offset_px < 210) {
            setLeftBlockWidth(210);
            setRightBlockWidth(window.innerWidth - 210);
        } else if (window.innerWidth - offset_px < 210) {
            setLeftBlockWidth(window.innerWidth - 210);
            setRightBlockWidth(210);
        } else {
            setLeftBlockWidth(offset_px);
            setRightBlockWidth(window.innerWidth - offset_px);
        }
    };

    const [{isDragging}, drag] = useDrag(() => ({
        type: 'mainDrag',
        collect: (monitor) => {
            if (monitor.isDragging()) {
                const position = monitor.getClientOffset();
                if (position) {
                    adjustWidth(position.x + 33);
                    adjustHeight(position.y - 21);
                }
            }
            return {
                isDragging: monitor.isDragging(),
            };
        },
    }));

    useEffect(() => {
        const handleResize = () => {
            setLeftBlockWidth(windowWidth / 2);
            setRightBlockWidth(windowWidth / 2);
            setInWorkHeight(windowHeight / 2 - 20);
            setReadyHeight(windowHeight / 2 - 20);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [windowHeight, windowWidth]);

    return {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        drag
    }
}

export default useResizableBlocks;