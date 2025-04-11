import {ListTypes} from "@widgets/EqCardList";
import {AppSwitch, AppTooltip} from "@shared/ui";
import React, {useState} from "react";
import {usePermission, useQueryParams} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

interface SwitchGroupByPlanDateProps {
    listType: ListTypes;
    totalPlan: number;
}

export const SwitchGroupByPlanDate = (props: SwitchGroupByPlanDateProps) => {
    const {listType, totalPlan} = props;

    const [checked, setChecked] = useState(!localStorage.getItem(`${listType}`));
    const {queryParameters, setQueryParam} = useQueryParams();

    const kpiPlan = usePermission(APP_PERM.KPI_PAGE);

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
                    style={{fontSize: '8px'}}
                    checked={!checked}
                    onSwitch={switchHandle}
                    labelPosition={'labelRight'}
                    handleContent={'⬛️'}
                    label={checked ? "По карточкам" : "По план дате"}
                />
            </AppTooltip>
            {(!checked && kpiPlan) && (
                <span style={{fontSize: 8}}>{totalPlan.toLocaleString("ru-RU")}</span>
            )}
        </>
    );
};