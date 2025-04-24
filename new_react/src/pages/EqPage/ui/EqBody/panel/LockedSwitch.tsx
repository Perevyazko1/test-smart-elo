import {AppSwitch, AppTooltip} from "@shared/ui";
import React from "react";
import {useQueryParams} from "@shared/hooks";


export const LockedSwitch = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const showNotLockedOnly = () => {
        if (queryParameters.locked) {
            setQueryParam('locked', '')
        } else {
            setQueryParam('locked', 'all')
        }
    };

    return (
        <AppTooltip title="Отобразить наряды в ожидании только без блокировки">
            <AppSwitch
                style={{fontSize: '10px'}}
                checked={!!queryParameters.locked}
                onSwitch={showNotLockedOnly}
                labelPosition={'labelRight'}
                handleContent={'🔒'}
                label={"Блокировка"}
            />
        </AppTooltip>
    );
};