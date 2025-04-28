import {useEffect, useState, useCallback, useMemo} from "react";

type StorageType = 'local' | 'session';

interface UseStorageInitParams {
    storageKey: string;
    paramKey: string;
    paramValue: string;
    defaultValue: string;
    setParamClb: (key: string, value: string) => void;
    storageType?: StorageType;
    skip?: boolean;
}

export function useStorageInit({
                                   storageKey,
                                   paramKey,
                                   paramValue,
                                   defaultValue,
                                   setParamClb,
                                   storageType = 'local',
                                   skip = false,
                               }: UseStorageInitParams) {
    const [inited, setInited] = useState(false);
    const [storedValue, setStoredValueState] = useState<string>(defaultValue);

    const storage = useMemo(() => {
        return storageType === 'local' ? localStorage : sessionStorage;
    }, [storageType]);

    const setStoredValue = useCallback((newValue: string) => {
        try {
            storage.setItem(storageKey, newValue);
            setStoredValueState(newValue);
        } catch (error) {
            console.error(`Failed to set storage item ${storageKey}`, error);
        }
    }, [storage, storageKey]);

    useEffect(() => {
        if (!skip) {
            try {
                const stored = storage.getItem(storageKey);

                if (stored !== null) {
                    setStoredValueState(stored);
                    console.log(stored, paramValue);
                    if (stored !== paramValue) {
                        setParamClb(paramKey, stored);
                    }
                } else {
                    setParamClb(paramKey, defaultValue);
                    setStoredValueState(defaultValue);
                }
            } catch (error) {
                console.error(`Failed to parse storage item ${storageKey}`, error);
            } finally {
                setInited(true);
            }
        }
        //eslint-disable-next-line
    }, [skip, defaultValue, paramKey, setParamClb, storage, storageKey]);

    return {inited, storedValue, setStoredValue};
}
