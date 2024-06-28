import { useCallback, useRef } from 'react';
import clickSound from "@shared/assets/sounds/click.mp3";


export const useClickSound = () => {
    const audioRef = useRef(new Audio(clickSound));

    const playClick = useCallback(() => {
        audioRef.current.play().then();
    }, []);

    return playClick;
};
