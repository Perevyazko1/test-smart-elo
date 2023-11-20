import {useContext} from "react";
import {AppInCompactMode} from "@app";

export const useCompactMode = () => {
    const compactMode = useContext(AppInCompactMode);

    if (!compactMode) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }

    return compactMode;
}