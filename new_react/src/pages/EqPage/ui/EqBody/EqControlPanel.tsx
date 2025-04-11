import React, {memo, useMemo} from "react";

import {useQueryParams} from "@shared/hooks";
import {ListTypes} from "@widgets/EqCardList";
import {AssembledSwitch} from "@pages/EqPage/ui/EqBody/AssembledSwitch";
import {LockedSwitch} from "@pages/EqPage/ui/EqBody/LockedSwitch";
import {SwitchGroupByPlanDate} from "@pages/EqPage/ui/EqBody/SwitchGroupByPlanDate";


interface EqControlPanelProps {
    listType: ListTypes;
    totalPlan: number;
}

export const EqControlPanel = memo((props: EqControlPanelProps) => {
    const {listType, totalPlan} = props;

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
                <SwitchGroupByPlanDate listType={listType} totalPlan={totalPlan}/>

            </div>
        </div>
    );
});