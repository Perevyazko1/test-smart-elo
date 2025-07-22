import {AppSwitch, AppTooltip} from "@shared/ui";
import React from "react";
import {useQueryParams, useStorageString} from "@shared/hooks";


export const LockedSwitch = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const QUERY_KEY = "locked";

    const {inited, setValue} = useStorageString({
            key: QUERY_KEY,
            onChangeCallback: (setValue) => {
                setQueryParam(
                    QUERY_KEY,
                    setValue ? setValue : ""
                )
            },
            defaultValue: "",
            storageType: "sessionStorage",
        }
    );

    const showNotLockedOnly = () => {
        setValue(
            queryParameters[QUERY_KEY] ? "" : "all"
        )
    }

    return (
        <AppTooltip title="Отобразить наряды в ожидании только без блокировки">
            <AppSwitch
                disabled={!inited}
                style={{fontSize: '10px'}}
                checked={!!queryParameters.locked}
                onSwitch={showNotLockedOnly}
                labelPosition={'labelRight'}
                handleContent={'🔒'}
                label={"Без блока"}
            />
        </AppTooltip>
    );
};