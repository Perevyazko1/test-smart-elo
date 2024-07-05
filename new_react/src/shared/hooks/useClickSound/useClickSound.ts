import {useCallback, useContext} from 'react';
import {AudioContext} from "@app";

export const useClickSound = () => {
    const audio = useContext(AudioContext);

    const playClick = useCallback(() => {
        if (audio) {
            audio.play().then();
        }
    }, [audio]);

    return playClick;
};
