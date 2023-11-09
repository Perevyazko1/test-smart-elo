import {useContext} from "react";
import {UseQueryParamsResult} from "@shared/hooks";
import {QueryParamsContext} from "@features";

export const useAppQuery = (): UseQueryParamsResult => {
    const appQuery = useContext(QueryParamsContext);

    if (!appQuery) {
        throw new Error("SomeComponent must be used within a QueryParamsContext.Provider");
    }

    return appQuery;
}