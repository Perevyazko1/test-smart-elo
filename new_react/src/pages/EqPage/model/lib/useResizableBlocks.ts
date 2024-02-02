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
    // Свитч кейс для обработки экшенов и изменения стейта
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

// Незамысловатый тротлер для функций с аргументами
function throttle(func: (arg: any) => void, limit: number) {
    let inThrottle: boolean;
    return function (this: any, arg: number) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, [arg]);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const useResizableBlocks = (windowWidth: number, windowHeight: number, offset: Offset) => {
    // поднимаем стейт с диспатчем для работы с параметрами размеров блоков
    const [state, dispatch] = useReducer(reducer, initialState(windowWidth, windowHeight));

    // Обработка изменения положения по вертикали управляемого элемента
    const adjustHeight = useCallback((offset_px: number) => {
        let newInWorkHeight: number;
        let newReadyHeight: number;

        // Механизм примагничивания блоков
        if (offset_px < 30) {
            // Схлопывание блока в работе
            newInWorkHeight = 0;
            newReadyHeight = windowHeight - 38;
        } else if (offset_px > windowHeight - 60) {
            // Схлопывание блока готовых изделий
            newInWorkHeight = windowHeight - 38;
            newReadyHeight = 0;
        } else {
            // Иначе обычное изменение размеров с учетом высоты блока недель между блоками
            newInWorkHeight = offset_px;
            newReadyHeight = windowHeight - offset_px - 36;
        }
        // Через диспатч меняем состояние размеров блоков
        dispatch({type: 'SET_HEIGHT', inWork: newInWorkHeight, ready: newReadyHeight});
    }, [windowHeight]);


    // Обработка изменения положения по горизонтали управляемого элемента
    const adjustWidth = useCallback((offset_px: number) => {
        let newLeftWidth: number;
        let newRightWidth: number;

        // Изменения размеров блока происходит до установки минимального значения размеров этих блоков
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
        // Через диспатч меняем значения
        dispatch({type: 'SET_WIDTH', left: newLeftWidth, right: newRightWidth});
    }, [windowWidth]);

    // Коллбек сброса размеров блоков до значений по умолчанию
    const resetSize = useCallback(() => {
        dispatch({type: 'RESET', windowWidth, windowHeight});
    }, [windowWidth, windowHeight]);

    // Оборачиваем коллбеки изменения размеров в троттлер для оптимизации
    const throttledAdjustWidth = throttle(adjustWidth, 3);
    const throttledAdjustHeight = throttle(adjustHeight, 3);

    // Используем внешнюю библиотеку для работы с механизмом dnd
    const [{isDragging}, drag] = useDrag(() => ({
        type: 'mainDrag',
        collect: (monitor) => {
            if (monitor.isDragging()) {
                // Считываем положение элемента
                const position = monitor.getClientOffset();
                if (position) {

                    console.log('rerender')
                    // По отдельности вызываем коллбеки для изменения размеров
                    throttledAdjustWidth(position.x + offset.x);
                    throttledAdjustHeight(position.y + offset.y);
                }
            }
            return {
                // Возвращаем состояние элемента перемещается ли он
                isDragging: monitor.isDragging(),
            };
        },
    }));

    // Возвращаем размеры блоков из стейта, состояние отслеживаемого элемента, коллбек для сброса размеров и drag ref
    // элемента который будем отслеживать
    return {
        ...state,
        isDragging,
        resetSize,
        drag
    }
}

export default useResizableBlocks;