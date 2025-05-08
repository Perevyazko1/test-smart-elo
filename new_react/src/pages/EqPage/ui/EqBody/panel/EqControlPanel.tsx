import React, {memo, useMemo} from "react";

import {useQueryParams} from "@shared/hooks";
import {ListTypes} from "@widgets/EqCardList";

import {AssembledSwitch} from "./AssembledSwitch";
import {LockedSwitch} from "./LockedSwitch";
import {SwitchGroupByPlanDate} from "./SwitchGroupByPlanDate";
import {SwitchShowSum} from "./SwitchShowSum";
import {SwitchTimingInfo} from "@pages/EqPage/ui/EqBody/panel/SwitchTimingInfo";
import {SwitchShowAll} from "@pages/EqPage/ui/EqBody/panel/SwitchShowAll";


interface EqControlPanelProps {
    listType: ListTypes;
    totalPlan: number;
    totalTiming: number;
}

export const EqControlPanel = memo((props: EqControlPanelProps) => {
    const {listType, totalPlan, totalTiming} = props;

    const {queryParameters} = useQueryParams();

    const showPanel = useMemo(() => {
        return !!queryParameters.pro
    }, [queryParameters.pro])

    if (!showPanel) {
        return null;
    }


    return (
        <div
            className={''}
            style={{
                width: '100%',
                maxWidth: '1200px',
                height: '28px',
                padding: '0.15rem',
            }}
        >
            <div
                className={'d-flex justify-content-start align-items-center text-white rounded h-100 bg-black bg-gradient gap-3'}
                style={{
                    padding: '0.15rem 0.35rem',
                }}
            >
                {listType === "await" && (
                    <>
                        <AssembledSwitch/>
                        <LockedSwitch/>
                    </>
                )}

                {listType !== "ready" && (
                    <SwitchGroupByPlanDate listType={listType}/>
                )}
                <SwitchShowSum listType={listType} totalPlan={totalPlan}/>
                <SwitchTimingInfo listType={listType} totalTiming={totalTiming}/>

                {listType === "ready"&& (
                    <SwitchShowAll/>
                )}
            </div>
        </div>
    );
});