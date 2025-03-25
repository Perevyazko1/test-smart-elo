import React, {useMemo} from "react";

import {useQueryParams} from "@shared/hooks";
import {ListTypes} from "@widgets/EqCardList";
import {AssembledSwitch} from "@pages/EqPage/ui/EqBody/AssembledSwitch";
import {LockedSwitch} from "@pages/EqPage/ui/EqBody/LockedSwitch";


interface EqControlPanelProps {
    listType: ListTypes;
}

export const EqControlPanel = (props: EqControlPanelProps) => {
    const {listType} = props;

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
                    padding: '0.15rem',
                }}
            >
                {listType === "await" && (
                    <>
                        <AssembledSwitch/>

                        <LockedSwitch/>
                    </>
                )}
            </div>
        </div>
    );
};