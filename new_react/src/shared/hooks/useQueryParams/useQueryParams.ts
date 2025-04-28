import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";

export interface UseQueryParamsResult {
    setQueryParam: (param: string, value: string) => void;
    queryParameters: Record<string, string>;
    initialLoad: boolean;
}

export const useQueryParams = (): UseQueryParamsResult => {
    const location = useLocation();
    const navigate = useNavigate();
    const [queryParameters, setQueryParameters] = useState({});

    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const updatedParams = new URLSearchParams(location.search);
        const initialParams: Record<string, string> = {};

        updatedParams.forEach((value, key) => {
            initialParams[key] = value;
        });

        setQueryParameters(initialParams);
        setInitialLoad(false);
    }, [location.search]);

    const setQueryParam = (param: string, value: string) => {
        if (!initialLoad) {
            const updatedParams = new URLSearchParams(location.search);
            if (value) {
                updatedParams.set(param, value);
            } else {
                updatedParams.delete(param);
            }

            navigate({
                ...location,
                search: updatedParams.toString(),
            }, { replace: true });
        }
    };

    return {setQueryParam, queryParameters, initialLoad};
};