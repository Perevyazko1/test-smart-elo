import React from "react";

import {useQueryParams, useStorageString} from "@shared/hooks";
import {AppSelect} from "@shared/ui";


const SortModes: { [key: string]: string } = {
    '0': 'По сроку',
    '1': 'По срочности',
    '2': 'Сначала новые',
}

export const SortModeNav = () => {
    const sortVariants = Object.keys(SortModes);

    const {queryParameters, setQueryParam} = useQueryParams();

    const QUERY_KEY = "sort_mode"

    const {inited, setValue} = useStorageString({
        key: QUERY_KEY,
        onChangeCallback: (mode) => setQueryParam(QUERY_KEY, mode || ""),
        defaultValue: sortVariants[1],
        storageType: "localStorage",
    });

    return (
        <AppSelect
            noInput
            style={{width: 150}}
            variant={'dropdown'}
            isLoading={!inited}
            label={'Сортировка'}
            value={queryParameters[QUERY_KEY] || ""}
            colorScheme={'darkInput'}
            options={sortVariants}
            getOptionLabel={option => SortModes[option]}
            onSelect={setValue}
        />
    );
};
