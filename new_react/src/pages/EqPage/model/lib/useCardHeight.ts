import {useCompactMode} from "@shared/hooks";

export const useCardHeight = () => {
    const {isCompactMode} = useCompactMode();

    if (isCompactMode) {
        return 80;
    } else {
        return 104;
    }
}