import React from "react";

import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

export const StaffWagesByTargetDateFilter = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const showWagesOnly = () => {
        if (!queryParameters.by_target_date) {
            setQueryParam('by_target_date', 'false');
        } else {
            setQueryParam('by_target_date', '');
        }
    };

    return (
        <AppTooltip title="Показывать транзакции по дате их закрепления / по дате внесения">
            <AppSwitch
                style={{transform: "scale(0.7) translate(0, 7px)", fontSize: '10px', margin: '-10px'}}
                checked={!!queryParameters.by_target_date}
                onSwitch={showWagesOnly}
                labelPosition={'labelBottom'}
                handleContent={'🕦'}
                label={!queryParameters.by_target_date ? "По закреплению" : "По добавлению"}
            />
        </AppTooltip>
    );
};
