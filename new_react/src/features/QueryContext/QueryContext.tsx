import {createContext, ReactNode} from "react";
import {useQueryParams, UseQueryParamsResult} from "@shared/hooks";

export const QueryParamsContext = createContext<UseQueryParamsResult | null>(null);

interface QueryContextProps {
    children: ReactNode;
}

export const QueryContext = (props: QueryContextProps) => {
    const queryParams = useQueryParams();

    return (
        <QueryParamsContext.Provider value={queryParams}>
            {props.children}
        </QueryParamsContext.Provider>
    );
};
