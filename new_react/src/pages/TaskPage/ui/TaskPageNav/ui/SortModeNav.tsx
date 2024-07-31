import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {taskPageActions} from "@pages/TaskPage/model/slice";
import {getSortModeInited} from "@pages/TaskPage/model/selectors";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

const SortModes: { [key: string]: string } = {
    '0': 'По сроку',
    '1': 'По срочности',
    '2': 'Сначала новые',
}

export const SortModeNav = () => {
        const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
        const dispatch = useAppDispatch();
        const [selectedSortMode, setSelectedSortMode] = useState<string | null>(null);
        const filtersInited = useAppSelector(getSortModeInited);

        const sortVariants = Object.values(SortModes);

        const setSortModeClb = (sortValue: string | null) => {
            const entry = Object.entries(SortModes).find(([key, val]) => val === sortValue);
            if (!entry || !sortValue || sortValue === SortModes[0]) {
                setQueryParam('sort_mode', '')
            } else {
                setQueryParam('sort_mode', entry[0])
            }
        };

        useEffect(() => {
            if (filtersInited) {
                if (queryParameters.sort_mode && SortModes[queryParameters.sort_mode]) {
                    setSelectedSortMode(SortModes[queryParameters.sort_mode]);
                } else {
                    setSelectedSortMode(null);
                }
            }
        }, [filtersInited, queryParameters.sort_mode]);

        useEffect(() => {
            if (!initialLoad && !filtersInited) {
                dispatch(taskPageActions.sortModeInited());
            }
        }, [dispatch, filtersInited, initialLoad]);


        return (
            <AppAutocomplete
                colorscheme={'dark'}
                style={{marginTop: "3px"}}
                label={selectedSortMode ? 'Сортировка' : 'Сорт. (По сроку)'}
                variant={'select'}
                value={selectedSortMode}
                onChangeClb={setSortModeClb}
                options={sortVariants}
                width={180}
            />
        );
    }
;
