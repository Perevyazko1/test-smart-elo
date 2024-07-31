import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {getViewModeInited} from "@pages/TaskPage/model/selectors";
import {taskPageActions} from "@pages/TaskPage/model/slice";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";


const ViewModes: { [key: string]: string } = {
    '0': 'Все',
    '1': 'Только мне',
    '2': 'В моих отделах',
    '3': 'Отмененные',
    '4': 'Я исполнитель',
    '5': 'Я соисполнитель',
    '6': 'Я назначил',
}

export const ViewModeNav = () => {
    const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
    const dispatch = useAppDispatch();

    const [selectedViewMode, setSelectedViewMode] = useState<string | null>(null);
    const viewModes = Object.values(ViewModes);
    const filtersInited = useAppSelector(getViewModeInited);

    const setViewModeClb = (viewValue: string | null) => {
        const entry = Object.entries(ViewModes).find(([key, val]) => val === viewValue);

        if (!viewValue || viewValue === ViewModes['0'] || !entry) {
            setQueryParam('view_mode', '')
        } else {
            setQueryParam('view_mode', entry[0])
        }
    };

    useEffect(() => {
        if (filtersInited) {
            if (!queryParameters.view_mode) {
                setSelectedViewMode(null);
            } else {
                setSelectedViewMode(ViewModes[queryParameters.view_mode]);
            }
        }
    }, [filtersInited, queryParameters.view_mode]);


    useEffect(() => {
        if (!initialLoad && !filtersInited) {
            dispatch(taskPageActions.viewModeInited());
        }
    }, [dispatch, filtersInited, initialLoad, queryParameters.view_mode, setQueryParam]);

    return (
        <AppAutocomplete
            colorscheme={'dark'}
            style={{marginTop: "3px"}}
            label={selectedViewMode ? 'Видимость' : 'Видимость (Все)'}
            variant={'select'}
            value={selectedViewMode}
            onChangeClb={setViewModeClb}
            options={viewModes}
            width={190}
        />
    );
};
