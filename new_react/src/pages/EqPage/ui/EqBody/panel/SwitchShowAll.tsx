import React, {useState} from "react";

import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";


export const SwitchShowAll = () => {
    const {queryParameters, setQueryParam} = useQueryParams();
    const [checked, setChecked] = useState(!queryParameters.show_all);

    const switchHandle = () => {
        setChecked(prevState => !prevState);
        if (queryParameters.project) {
            setQueryParam("show_all", queryParameters.show_all ? "" : "true");
        }
    }

    return (
        <AppTooltip title="Отображать независимо от даты. Сперва выберите проект.">
            <AppSwitch
                style={{fontSize: '10px'}}
                checked={!checked && !!queryParameters.project}
                onSwitch={switchHandle}
                disabled={!queryParameters.project}
                labelPosition={'labelRight'}
                handleContent={'👁️'}
                label={`Показать все`}
            />
        </AppTooltip>
    );
};