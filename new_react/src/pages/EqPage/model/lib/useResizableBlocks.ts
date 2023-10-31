import {useCallback, useReducer} from "react";
import {useDrag} from "react-dnd";

interface Offset {
    x: number;
    y: number;
}

interface ResizableBlocksState {
    leftBlockWidth: number;
    rightBlockWidth: number;
    inWorkHeight: number;
    readyHeight: number;
}

interface ResizableBlocksActions {
    type: 'SET_WIDTH' | 'SET_HEIGHT' | 'RESET';
    left?: number;
    right?: number;
    inWork?: number;
    ready?: number;
    windowWidth?: number;
    windowHeight?: number;
}


const MIN_WIDTH = 210;
const VERTICAL_PADDING = 18;

const initialState = (windowWidth: number, windowHeight: number): ResizableBlocksState => ({
    leftBlockWidth: windowWidth / 2,
    rightBlockWidth: windowWidth / 2,
    inWorkHeight: windowHeight / 2 - VERTICAL_PADDING,
    readyHeight: windowHeight / 2 - VERTICAL_PADDING
});

const reducer = (state: ResizableBlocksState, action: ResizableBlocksActions): ResizableBlocksState => {
    switch (action.type) {
        case 'SET_WIDTH':
            return {
                ...state,
                leftBlockWidth: action.left!,
                rightBlockWidth: action.right!
            };
        case 'SET_HEIGHT':
            return {
                ...state,
                inWorkHeight: action.inWork!,
                readyHeight: action.ready!
            };
        case 'RESET':
            return initialState(action.windowWidth!, action.windowHeight!);
        default:
            return state;
    }
};

function throttle(func: (arg: any) => void, limit: number) {
    let inThrottle: boolean;
    return function(this: any, arg: number) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, [arg]);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const useResizableBlocks = (windowWidth: number, windowHeight: number, offset: Offset) => {
    const [state, dispatch] = useReducer(reducer, initialState(windowWidth, windowHeight));

    const adjustHeight = useCallback((offset_px: number) => {
        let newInWorkHeight: number;
        let newReadyHeight: number;

        if (offset_px < 30) {
            newInWorkHeight = 0;
            newReadyHeight = windowHeight - 38;
        } else if (offset_px > windowHeight - 60) {
            newInWorkHeight = windowHeight - 38;
            newReadyHeight = 0;
        } else {
            newInWorkHeight = offset_px;
            newReadyHeight = windowHeight - offset_px - 36;
        }
        dispatch({type: 'SET_HEIGHT', inWork: newInWorkHeight, ready: newReadyHeight});
    }, [windowHeight]);


    const adjustWidth = useCallback((offset_px: number) => {
        let newLeftWidth: number;
        let newRightWidth: number;

        if (offset_px < MIN_WIDTH) {
            newLeftWidth = MIN_WIDTH;
            newRightWidth = windowWidth - MIN_WIDTH;
        } else if (windowWidth - offset_px < MIN_WIDTH) {
            newLeftWidth = windowWidth - MIN_WIDTH;
            newRightWidth = MIN_WIDTH;
        } else {
            newLeftWidth = offset_px;
            newRightWidth = windowWidth - offset_px;
        }

        dispatch({type: 'SET_WIDTH', left: newLeftWidth, right: newRightWidth});
    }, [windowWidth]);


    const resetSize = useCallback(() => {
        dispatch({type: 'RESET', windowWidth, windowHeight});
    }, [windowWidth, windowHeight]);

    const throttledAdjustWidth = throttle(adjustWidth, 2);
    const throttledAdjustHeight = throttle(adjustHeight, 2);

    const [{isDragging}, drag] = useDrag(() => ({
        type: 'mainDrag',
        collect: (monitor) => {
            if (monitor.isDragging()) {
                const position = monitor.getClientOffset();
                if (position) {
                    throttledAdjustWidth(position.x + offset.x);
                    throttledAdjustHeight(position.y + offset.y);
                }
            }
            return {
                isDragging: monitor.isDragging(),
            };
        },
    }));

    return {
        ...state,
        isDragging,
        resetSize,
        drag
    }
}

export default useResizableBlocks;