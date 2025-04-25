import React, {useState} from "react";

import {ListTypes} from "@widgets/EqCardList";
import {AppSwitch, AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

interface SwitchGroupByPlanDateProps {
    listType: ListTypes;
}

export const SwitchGroupByPlanDate = (props: SwitchGroupByPlanDateProps) => {
    const {listType} = props;

    const [checked, setChecked] = useState(!localStorage.getItem(`${listType}`));
    const {queryParameters, setQueryParam} = useQueryParams();

    const switchHandle = () => {
        setChecked(prevState => {
            if (prevState) {
                localStorage.setItem(`${listType}`, 'by_date');
            } else {
                localStorage.removeItem(`${listType}`);
            }
            return !prevState;
        });
        setQueryParam("sortUpdated", queryParameters.sortUpdated ? "" : "updated");
    }

    return (
        <>
            <AppTooltip title="Группировка нарядов">
                <AppSwitch
                    style={{fontSize: '10px'}}
                    checked={!checked}
                    onSwitch={switchHandle}
                    labelPosition={'labelRight'}
                    handleContent={'📆'}
                    label={"План"}
                />
            </AppTooltip>
        </>
    );
};