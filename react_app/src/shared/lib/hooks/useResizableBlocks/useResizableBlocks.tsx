import {useState} from 'react';
import {useDrag} from 'react-dnd';


const useResizableBlocks = (windowWidth: number, windowHeight: number) => {
    const [leftBlockWidth, setLeftBlockWidth] = useState(windowWidth / 2);
    const [rightBlockWidth, setRightBlockWidth] = useState(windowWidth / 2);
    const [inWorkHeight, setInWorkHeight] = useState(windowHeight / 2 - 18);
    const [readyHeight, setReadyHeight] = useState(windowHeight / 2 - 18);

    const adjustHeight = (offset_px: number) => {
        if (offset_px < 30) {
            setInWorkHeight(0);
            setReadyHeight(windowHeight - 38);
        } else if (offset_px > windowHeight - 60) {
            setInWorkHeight(windowHeight - 38);
            setReadyHeight(0);
        } else {
            setInWorkHeight(offset_px);
            setReadyHeight(windowHeight - offset_px - 36);
        }
    }

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
    }

    const resetSize = () => {
        setLeftBlockWidth(windowWidth / 2)
        setRightBlockWidth(windowWidth / 2)
        setInWorkHeight(windowHeight / 2 - 18)
        setReadyHeight(windowHeight / 2 - 18)
    }

    const [{isDragging}, drag] = useDrag(() => ({
        type: 'mainDrag',
        collect: (monitor) => {
            if (monitor.isDragging()) {
                const position = monitor.getClientOffset();
                if (position) {
                    adjustWidth(position.x + 25);
                    adjustHeight(position.y - 15);
                }
            }
            return {
                isDragging: monitor.isDragging(),
            };
        },
    }));

    return {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        resetSize,
        drag
    }
}

export default useResizableBlocks;