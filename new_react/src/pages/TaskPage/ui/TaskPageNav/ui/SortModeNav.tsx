import React, {useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {taskPageActions} from "@pages/TaskPage/model/slice";
import {getSortModeInited} from "@pages/TaskPage/model/selectors";
import {AppSelect} from "@shared/ui";

const SortModes: { [key: string]: string } = {
    '0': 'По сроку',
    '1': 'По срочности',
    '2': 'Сначала новые',
}

export const SortModeNav = () => {
    const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
    const dispatch = useAppDispatch();
    const filtersInited = useAppSelector(getSortModeInited);

    const sortVariants = Object.keys(SortModes);

    const setSortModeClb = (sortValue: string) => {
        setQueryParam('sort_mode', sortValue)
    };

    useEffect(() => {
        if (!initialLoad && !filtersInited) {
            if (!queryParameters.sort_mode) {
                setQueryParam('sort_mode', sortVariants[1])
            } else {
                dispatch(taskPageActions.sortModeInited(true));
            }
        }
    }, [dispatch, filtersInited, initialLoad, queryParameters.sort_mode, setQueryParam, sortVariants]);

    const sortModeValue = useMemo(() => {
        return queryParameters.sort_mode || '1';
    }, [queryParameters.sort_mode]);

    return (
        <AppSelect
            noInput
            style={{width: 150}}
            variant={'dropdown'}
            isLoading={initialLoad}
            label={'Сортировка'}
            value={sortModeValue}
            colorScheme={'darkInput'}
            options={sortVariants}
            getOptionLabel={option => SortModes[option]}
            onSelect={setSortModeClb}
        />
    );
};
