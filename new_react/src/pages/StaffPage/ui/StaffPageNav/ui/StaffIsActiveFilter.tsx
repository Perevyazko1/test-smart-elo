import React from "react";

import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

export const StaffIsActiveFilter = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const showIsActiveOnly = () => {
        if (!queryParameters.is_active) {
            setQueryParam('is_active', 'false');
        } else {
            setQueryParam('is_active', '');
        }
    };

    return (
        <AppTooltip title="Отображать уволенных сотудников">
            <AppSwitch
                style={{transform: "scale(0.7) translate(0, 7px)", fontSize: '10px'}}
                checked={!!queryParameters.is_active}
                onSwitch={showIsActiveOnly}
                labelPosition={'labelBottom'}
                handleContent={'✅'}
                label={!queryParameters.is_active ? "Акт." : "Все"}
            />
        </AppTooltip>
    );
};
