import React from "react";

import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

export const StaffWagesOnlyFilter = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const showWagesOnly = () => {
        if (!queryParameters.wages_only) {
            setQueryParam('wages_only', 'false');
        } else {
            setQueryParam('wages_only', '');
        }
    };

    return (
        <AppTooltip title="Отображать только ФОТ">
            <AppSwitch
                style={{transform: "scale(0.7) translate(0, 7px)", fontSize: '10px'}}
                checked={!!queryParameters.wages_only}
                onSwitch={showWagesOnly}
                labelPosition={'labelBottom'}
                handleContent={'👷'}
                label={!!queryParameters.wages_only ? "ФОТ" : "Все"}
            />
        </AppTooltip>
    );
};
