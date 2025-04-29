import React, {useMemo} from "react";

import {useDepartmentList} from "@entities/Department";
import {useQueryParams, useStorageString} from "@shared/hooks";
import {AppSelect} from "@shared/ui";

export const DepartmentFilter = () => {
    const {data, isLoading} = useDepartmentList({});
    const {queryParameters, setQueryParam} = useQueryParams();

    const QUERY_KEY = "departments"

    const {inited, setValue} = useStorageString({
        key: QUERY_KEY,
        onChangeCallback: (mode) => setQueryParam(QUERY_KEY, mode || ""),
        storageType: "sessionStorage",
        skip: isLoading,
    });

    const selectClb = (dep_ids: number[] | null) => {
        const queryValue = dep_ids?.filter(item => item !== 0)?.join(",");
        setValue(queryValue || '');
    };

    const selectedValue = useMemo(() => {
        return queryParameters[QUERY_KEY]?.split(",").map(item => Number(item)) || [];
    }, [queryParameters])

    const options = useMemo(() => {
        return data?.map(item => item.id) || [];
    }, [data]);

    return (
        <AppSelect
            style={{width: 160}}
            isLoading={!inited || isLoading}
            variant={'multiple'}
            colorScheme={'darkInput'}
            label={'Отделы'}
            value={selectedValue}
            onSelect={selectClb}
            getOptionLabel={option => data?.find(item => item.id === option)?.name || ""}
            options={options}
        />
    );
};
