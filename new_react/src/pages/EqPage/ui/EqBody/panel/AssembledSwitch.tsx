import {AppSwitch, AppTooltip} from "@shared/ui";
import React from "react";
import {useQueryParams, useStorageString} from "@shared/hooks";


export const AssembledSwitch = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const QUERY_KEY = "assembled";

    const {inited, setValue} = useStorageString({
        key: QUERY_KEY,
        onChangeCallback: (mode) => setQueryParam(QUERY_KEY, mode || ""),
        defaultValue: "",
        storageType: "localStorage",
    });

    const showAssembledOnly = () => {
        if (queryParameters.assembled) {
            setValue('');
        } else {
            setValue('all');
        }
    };

    return (
        <AppTooltip title="Отобразить наряды не укомплектованные полуфабрикатами">
            <AppSwitch
                disabled={!inited}
                style={{fontSize: '8px'}}
                checked={!!queryParameters.assembled}
                onSwitch={showAssembledOnly}
                labelPosition={'labelRight'}
                handleContent={'⬛️'}
                label={"Без компл."}
            />
        </AppTooltip>
    );
};