import {AppNavbar} from "@widgets/AppNavbar";
import {useQueryParams} from "@shared/hooks";
import {AppSwitch, AppTooltip} from "@shared/ui";
import React from "react";
import {DepartmentDropdown} from "@pages/TarifficationPage/ui/nav/DepartmentDropdown";


export const KpiNavbar = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const switchHandle = () => {
        if (queryParameters.showSum) {
            setQueryParam("showSum", "");
        } else {
            setQueryParam("showSum", "1");
        }
    }

    return (
        <AppNavbar>
            <DepartmentDropdown/>

            <AppTooltip title="Показывать сделку">
                <AppSwitch
                    style={{fontSize: '12px', color: 'black'}}
                    checked={!queryParameters.showSum}
                    onSwitch={switchHandle}
                    labelPosition={'labelRight'}
                    handleContent={'₽'}
                    label={""}
                />
            </AppTooltip>
        </AppNavbar>
    );
};