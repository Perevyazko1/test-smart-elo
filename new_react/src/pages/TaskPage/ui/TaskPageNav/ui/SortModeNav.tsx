import React from "react";

import {useQueryParams, useStorageInit} from "@shared/hooks";
import {AppSelect} from "@shared/ui";


const SortModes: { [key: string]: string } = {
    '0': 'По сроку',
    '1': 'По срочности',
    '2': 'Сначала новые',
}

export const SortModeNav = () => {
    const sortVariants = Object.keys(SortModes);

    const {queryParameters, setQueryParam} = useQueryParams();

    const {inited, storedValue, setStoredValue} = useStorageInit({
        storageKey: "last_sort_mode",
        paramKey: "sort_mode",
        paramValue: queryParameters.sort_mode,
        defaultValue: sortVariants[1],
        setParamClb: setQueryParam,
        storageType: "session",
    })

    return (
        <AppSelect
            noInput
            style={{width: 150}}
            variant={'dropdown'}
            isLoading={!inited}
            label={'Сортировка'}
            value={storedValue}
            colorScheme={'darkInput'}
            options={sortVariants}
            getOptionLabel={option => SortModes[option]}
            onSelect={setStoredValue}
        />
    );
};
