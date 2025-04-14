import {ListTypes} from "@widgets/EqCardList";
import {AppSwitch, AppTooltip} from "@shared/ui";
import React, {useState} from "react";
import {usePermission, useQueryParams} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

interface SwitchShowSumProps {
    listType: ListTypes;
    totalPlan: number;
}

export const SwitchShowSum = (props: SwitchShowSumProps) => {
    const {listType, totalPlan} = props;

    const [checked, setChecked] = useState(!localStorage.getItem(`${listType}ShowSum`));
    const {queryParameters, setQueryParam} = useQueryParams();

    const kpiPlan = usePermission(APP_PERM.KPI_PAGE);

    const switchHandle = () => {
        setChecked(prevState => {
            if (prevState) {
                localStorage.setItem(`${listType}ShowSum`, 'true');
            } else {
                localStorage.removeItem(`${listType}ShowSum`);
            }
            return !prevState;
        });
        setQueryParam("sortUpdated", queryParameters.sortUpdated ? "" : "updated");
    }

    return (
        <>
            <AppTooltip title="Группировка нарядов">
                <AppSwitch
                    style={{fontSize: '12px', color: 'black'}}
                    checked={!checked}
                    onSwitch={switchHandle}
                    labelPosition={'labelRight'}
                    handleContent={'₽'}
                    label={""}
                />
            </AppTooltip>
            {(!checked && kpiPlan) && (
                <span style={{fontSize: 8}}>{totalPlan.toLocaleString("ru-RU")}</span>
            )}
        </>
    );
};