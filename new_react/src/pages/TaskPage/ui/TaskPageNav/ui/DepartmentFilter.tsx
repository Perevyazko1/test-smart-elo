import React, {useMemo} from "react";

import {useDepartmentList} from "@entities/Department";
import {useQueryParams, useStorageInit} from "@shared/hooks";
import {AppSelect} from "@shared/ui";

export const DepartmentFilter = () => {
    const {data, isLoading} = useDepartmentList({});
    const {queryParameters, setQueryParam} = useQueryParams();

    const {inited, storedValue, setStoredValue} = useStorageInit({
        storageKey: "last_departments",
        paramKey: "departments",
        paramValue: queryParameters.departments || '',
        defaultValue: "",
        setParamClb: setQueryParam,
        storageType: "session",
        skip: isLoading,
    })

    const selectClb = (dep_ids: number[] | null) => {
        const queryValue = dep_ids?.filter(item => item !== 0)?.join(",");
        setStoredValue(queryValue || '');
    };

    const selectedValue = useMemo(() => {
        return storedValue.split(",").map(item => Number(item));
    }, [storedValue])

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
