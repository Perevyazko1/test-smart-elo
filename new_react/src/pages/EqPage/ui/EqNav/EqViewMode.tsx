import React, {useMemo} from "react";
import {useAppDispatch, useAppQuery, useAppSelector, usePermission, useStorageString} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppSelect, AppTooltip} from "@shared/ui";
import {eqPageActions} from "@pages/EqPage";

import {getEqViewMode} from "../../model/selectors/filterSelectors";


export const EqViewMode = () => {
    const dispatch = useAppDispatch();
    const viewModes = useAppSelector(getEqViewMode);
    const {queryParameters, setQueryParam} = useAppQuery();
    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);
    const behalfPerm = usePermission(APP_PERM.BEHALF_ACTIONS);
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const viewModesList = useMemo(() => {
        let result = viewModes?.filters;
        if (!bossPerm) {
            result = result?.filter(mode => mode.name !== 'Режим бригадира');
        }
        if (!behalfPerm) {
            result = result?.filter(mode => ['self', 'boss', 'unfinished', 'distribute'].includes(String(mode.key)));
        }
        if (isViewer) {
            result = result?.filter(mode => mode.name !== 'Личные наряды');
        }
        return result?.map(viewMode => viewMode.name) || [];
    }, [behalfPerm, bossPerm, isViewer, viewModes?.filters]);

    const QUERY_KEY = "view_mode";
    const {inited, setValue} = useStorageString({
        key: `EQ_${QUERY_KEY}`,
        onChangeCallback: (mode) => {
            const newState = viewModes?.filters.find(viewMode => viewMode.name === mode)?.key;
            if (newState) {
                setQueryParam(QUERY_KEY, newState === viewModes.default.key ? '' : String(newState));
            } else {
                setQueryParam(QUERY_KEY, '');
            }
            dispatch(eqPageActions.viewModeInited());
        },
        defaultValue: "",
        storageType: "sessionStorage",
    });

    const selectedViewMode = viewModes ?
        (queryParameters.view_mode
            && viewModes.filters.find(viewMode => viewMode.key === queryParameters.view_mode)?.name
        ) || viewModes.default.name : 'Загрузка';

    return (
        <AppTooltip title="Выбор шаблона режима просмотра нарядов">
            <AppSelect
                isLoading={!inited}
                variant={'dropdown'}
                style={{width: 155}}
                label={'Режим просмотра'}
                colorScheme={'darkInput'}
                value={selectedViewMode}
                options={viewModesList}
                onSelect={setValue}
            />
        </AppTooltip>
    );
};
