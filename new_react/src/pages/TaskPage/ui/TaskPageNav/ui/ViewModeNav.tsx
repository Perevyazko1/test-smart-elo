import React, {useMemo} from "react";

import {usePermission, useQueryParams, useStorageString} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppSelect} from "@shared/ui";

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

    const {queryParameters, setQueryParam} = useQueryParams();

    const QUERY_KEY = "view_mode"

    const {inited, setValue} = useStorageString({
        key: QUERY_KEY,
        onChangeCallback: (mode) => setQueryParam(QUERY_KEY, mode || ""),
        defaultValue: allViewModes[0].key,
        storageType: "localStorage",
    });

    return (
        <AppSelect
            noInput
            style={{width: 150}}
            isLoading={!inited}
            variant={'dropdown'}
            label={'Режим просмотра'}
            value={queryParameters[QUERY_KEY] || ""}
            options={allViewModes.map(item => item.key)}
            getOptionLabel={option => allViewModes.find(mode => mode.key === option)?.name || ""}
            onSelect={setValue}
            colorScheme={'darkInput'}
        />
    );
};
