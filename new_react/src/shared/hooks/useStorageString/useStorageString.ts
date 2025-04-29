import {useState, useEffect, useCallback} from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

interface UseStorageStringProps {
    key: string;
    storageType?: StorageType;
    defaultValue?: string;
    onChangeCallback: (value: string | null) => void;
    skip?: boolean;
}

interface UseStorageStringReturn {
    value: string | null;
    setValue: (newValue: string) => void;
    inited: boolean;
}

export const useStorageString = ({
                                     key,
                                     storageType = 'localStorage',
                                     defaultValue,
                                     onChangeCallback,
                                     skip,
                                 }: UseStorageStringProps): UseStorageStringReturn => {
    const [value, setValue] = useState<string | null>(null);
    const [inited, setInited] = useState(false);

    const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;

    const updateStorage = useCallback(
        (newValue: string) => {
            storage.setItem(key, newValue);
            setValue(newValue);
            onChangeCallback(newValue);
        },
        [key, storage, onChangeCallback]
    );

    useEffect(() => {
        if (!skip) {

            const storedValue = storage.getItem(key);
            let initialValue: string | null = null;

            if (storedValue !== null) {
                initialValue = storedValue;
            } else if (defaultValue !== undefined) {
                initialValue = defaultValue;
                storage.setItem(key, initialValue);
            }

            setValue(initialValue);
            if (initialValue !== null) {
                onChangeCallback(initialValue);
            }
            setInited(true);
        }
    }, [key, storage, defaultValue, onChangeCallback, skip]);

    return {value, setValue: updateStorage, inited};
};