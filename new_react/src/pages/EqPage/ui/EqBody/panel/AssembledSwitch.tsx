import {AppSwitch, AppTooltip} from "@shared/ui";
import React from "react";
import {useQueryParams} from "@shared/hooks";


export const AssembledSwitch = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const showAssembledOnly = () => {
        if (queryParameters.assembled) {
            setQueryParam('assembled', '')
        } else {
            setQueryParam('assembled', 'all')
        }
    };

    return (
        <AppTooltip title="Отобразить наряды не укомплектованные полуфабрикатами">
            <AppSwitch
                style={{fontSize: '8px'}}
                checked={!!queryParameters.assembled}
                onSwitch={showAssembledOnly}
                labelPosition={'labelRight'}
                handleContent={'⬛️'}
                label={"Комплектация"}
            />
        </AppTooltip>
    );
};