import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";

export interface UseQueryParamsResult {
    setQueryParam: (param: string, value: string) => void;
    setQueryParams: (params: Record<string, string>) => void;
    queryParameters: Record<string, string>;
    initialLoad: boolean;
}

export const useQueryParams = (): UseQueryParamsResult => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [initialLoad, setInitialLoad] = useState(true);
    useEffect(() => {
        setInitialLoad(false);
    }, []);

    const queryParameters = useMemo(() => {
        const entries = params.entries();
        const initialParams: Record<string, string> = {};

        for (let entry of entries) {
            initialParams[entry[0]] = entry[1];
        }

        return initialParams;
    }, [params]);

    const setQueryParam = useCallback(
        (param: string, value: string | null) => {
            const newParams = new URLSearchParams(params);
            if (value) {
                newParams.set(param, value);
            } else {
                newParams.delete(param);
            }

            const newSearch = newParams.toString();
            if (newSearch !== params.toString()) {
                navigate({...location, search: newSearch}, {replace: true});
            }
        },
        [navigate, location, params]
    );

    const setQueryParams = useCallback((updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(params);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        const newSearch = newParams.toString();
        if (newSearch !== params.toString()) {
            navigate({...location, search: newSearch}, {replace: true});
        }
    }, [navigate, location, params]);

    return {setQueryParam, queryParameters, setQueryParams, initialLoad};
};