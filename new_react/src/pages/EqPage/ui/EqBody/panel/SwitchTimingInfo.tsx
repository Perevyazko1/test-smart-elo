import React, {useState} from "react";

import {ListTypes} from "@widgets/EqCardList";
import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

interface SwitchTimingInfoProps {
    listType: ListTypes;
    totalTiming: number;
}

export const SwitchTimingInfo = (props: SwitchTimingInfoProps) => {
    const {listType, totalTiming} = props;

    const [checked, setChecked] = useState(!localStorage.getItem(`${listType}timing`));
    const {queryParameters, setQueryParam} = useQueryParams();

    const switchHandle = () => {
        setChecked(prevState => {
            if (prevState) {
                localStorage.setItem(`${listType}timing`, 'timing');
            } else {
                localStorage.removeItem(`${listType}timing`);
            }
            return !prevState;
        });
        setQueryParam("sortUpdated", queryParameters.sortUpdated ? "" : "updated");
    }

    return (
        <>
            <AppTooltip title="Отображать тайминг производства">
                <AppSwitch
                    style={{fontSize: '10px'}}
                    checked={!checked}
                    onSwitch={switchHandle}
                    labelPosition={'labelRight'}
                    handleContent={'🕐'}
                    label={`Тайм.(${totalTiming}ч)`}
                />
            </AppTooltip>
        </>
    );
};