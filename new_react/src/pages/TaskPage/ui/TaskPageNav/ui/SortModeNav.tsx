import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {AppDropdown} from "@shared/ui";
import {taskPageActions} from "@pages/TaskPage/model/slice";
import {getSortModeInited} from "@pages/TaskPage/model/selectors";

const SortModes: { [key: string]: string } = {
    '0': 'По сроку',
    '1': 'По срочности',
    '2': 'Сначала новые',
}

export const SortModeNav = () => {
    const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
    const dispatch = useAppDispatch();
    const [selectedSortMode, setSelectedSortMode] = useState(SortModes['0']);
    const filtersInited = useAppSelector(getSortModeInited);

    const sortVariants = Object.values(SortModes);

    const setSortModeClb = (sortValue: string) => {
        const entry = Object.entries(SortModes).find(([key, val]) => val === sortValue);
        if (entry) {
            setQueryParam('sort_mode', entry[0])
        } else {
            setQueryParam('sort_mode', '0')
        }
    };

    useEffect(() => {
        if (filtersInited && queryParameters.sort_mode && SortModes[queryParameters.sort_mode]) {
            setSelectedSortMode(SortModes[queryParameters.sort_mode]);
        }
    }, [filtersInited, queryParameters.sort_mode]);

    useEffect(() => {
        if (!initialLoad && !filtersInited) {
            if (!queryParameters.sort_mode) {
                setQueryParam('sort_mode', '0');
            }
            dispatch(taskPageActions.sortModeInited());
        }
    }, [dispatch, filtersInited, initialLoad, queryParameters.sort_mode, setQueryParam]);


    return (
        <AppDropdown
            onSelect={setSortModeClb}
            selected={selectedSortMode}
            items={sortVariants}
        />
    );
};
