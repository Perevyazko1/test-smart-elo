import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {AppDropdown} from "@shared/ui";
import {getViewModeInited} from "@pages/TaskPage/model/selectors";
import {taskPageActions} from "@pages/TaskPage/model/slice";


const ViewModes: { [key: string]: string } = {
    '0': 'Все доступные',
    '1': 'Видны только мне',
    '2': 'Видна в моих отделах',
    '3': 'Отмененные',
    '4': 'Я исполнитель',
    '5': 'Я соисполнитель',
    '6': 'Я назначил',
}

export const ViewModeNav = () => {
    const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
    const dispatch = useAppDispatch();

    const [selectedViewMode, setSelectedViewMode] = useState(ViewModes['0']);
    const viewModes = Object.values(ViewModes);
    const filtersInited = useAppSelector(getViewModeInited);

    const setViewModeClb = (viewValue: string) => {
        const entry = Object.entries(ViewModes).find(([key, val]) => val === viewValue);
        if (entry) {
            setQueryParam('view_mode', entry[0])
        } else {
            setQueryParam('view_mode', '0')
        }
    };

    useEffect(() => {
        if (filtersInited && queryParameters.view_mode && ViewModes[queryParameters.view_mode]) {
            setSelectedViewMode(ViewModes[queryParameters.view_mode]);
        }
    }, [filtersInited, queryParameters.view_mode]);


    useEffect(() => {
        if (!initialLoad && !filtersInited) {
            if (!queryParameters.view_mode) {
                setQueryParam('view_mode', '0');
            }
            dispatch(taskPageActions.viewModeInited());
        }
    }, [dispatch, filtersInited, initialLoad, queryParameters.view_mode, setQueryParam]);

    return (
        <AppDropdown
            onSelect={setViewModeClb}
            selected={selectedViewMode}
            items={viewModes}
        />
    );
};
