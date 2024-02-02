import {useContext} from "react";
import {IsLoadingContext} from "@app";

export const useAppIsLoading = () => {
    const isLoadingContext = useContext(IsLoadingContext);

    if (!isLoadingContext) {
        throw new Error("SomeComponent must be used within a IsLoadingContext.Provider");
    }

    return isLoadingContext;
}