import {useMemo, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";

export const useQueryParams = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [initialLoad, setInitialLoad] = useState(true);

    const queryParameters = useMemo(() => {
        const entries = params.entries();
        const initialParams: Record<string, string> = {};

        for (let entry of entries) {
            initialParams[entry[0]] = entry[1];
        }

        // После инициализации переключить initialLoad на false
        setInitialLoad(false);

        return initialParams;
    }, [params]);

    const setQueryParam = (param: string, value: string) => {
        if (!initialLoad) {
            if (value) {
                params.set(param, value);
            } else {
                params.delete(param);
            }

            navigate({...location, search: params.toString()});
        }
    };

    return { setQueryParam, queryParameters, initialLoad };
};