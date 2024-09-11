import React, {useEffect, useMemo} from "react";

import {useAppDispatch, useAppSelector, usePermission, useQueryParams} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppSelect} from "@shared/ui";

import {getViewModeInited} from "../../../model/selectors";
import {taskPageActions} from "../../../model/slice";

interface ViewModeItem {
    key: string,
    name: string,
}

const DefaultViewMode: ViewModeItem = {key: '0', name: 'Все'};

const ViewModes: ViewModeItem[] = [
    {key: '1', name: 'Только мне'},
    {key: '2', name: 'В моих отделах'},
    {key: '3', name: 'Отмененные'},
    {key: '4', name: 'Я исполнитель'},
    {key: '5', name: 'Я соисполнитель'},
    {key: '6', name: 'Я назначил'},
]

const TariffViewModes: ViewModeItem[] = [
    {key: '7', name: 'В тарификации'},
    {key: '8', name: 'Со сделкой'},
]

const AdminMode: ViewModeItem ={key: '10', name: 'Админ'}


export const ViewModeNav = () => {
    const {initialLoad, queryParameters, setQueryParam} = useQueryParams();
    const dispatch = useAppDispatch();

    const confirmTariffPerm = usePermission(APP_PERM.TARIFFICATION_CONFIRM);
    const adminPerm = usePermission(APP_PERM.ADMIN);

    const allViewModes: ViewModeItem[] = useMemo(() => {
        let resultViewModes: ViewModeItem[] = [DefaultViewMode, ...ViewModes]
        
        if (confirmTariffPerm) {
            resultViewModes = [...resultViewModes, ...TariffViewModes];
        }
        if (adminPerm) {
            resultViewModes = [...resultViewModes, AdminMode];
        }
        return resultViewModes;
    }, [adminPerm, confirmTariffPerm]);

    const filtersInited = useAppSelector(getViewModeInited);

    const setViewModeClb = (viewValue: ViewModeItem) => {
        setQueryParam('view_mode', viewValue.key);
    };

    useEffect(() => {
        if (!initialLoad && !filtersInited) {
            if (!queryParameters.view_mode) {
                setQueryParam('view_mode', DefaultViewMode.key);
            } else {
                const allowedViewMode: boolean = allViewModes.some(item => item.key === queryParameters.view_mode);
                if (allowedViewMode) {
                    dispatch(taskPageActions.viewModeInited(true));
                } else {
                    setQueryParam('view_mode', DefaultViewMode.key);
                }
            }
        }
    }, [allViewModes, dispatch, filtersInited, initialLoad, queryParameters.view_mode, setQueryParam]);

    const viewModeValue: ViewModeItem = useMemo(() => {
        const targetViewMode = allViewModes.find(item => item.key === queryParameters.view_mode)
        return targetViewMode || DefaultViewMode;
    }, [allViewModes, queryParameters.view_mode])

    return (
        <AppSelect
            noInput
            style={{width: 150}}
            isLoading={initialLoad}
            variant={'dropdown'}
            label={'Режим просмотра'}
            value={viewModeValue || ''}
            options={allViewModes}
            getOptionLabel={option => option.name}
            onSelect={setViewModeClb}
            colorScheme={'darkInput'}
        />
    );
};
