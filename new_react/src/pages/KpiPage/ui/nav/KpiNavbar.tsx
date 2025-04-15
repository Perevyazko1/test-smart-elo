import {AppNavbar} from "@widgets/AppNavbar";
import {useCurrentUser, useQueryParams} from "@shared/hooks";
import {AppSelect, AppSwitch, AppTooltip} from "@shared/ui";
import React, {useMemo} from "react";
import {Department} from "@entities/Department";


export const KpiNavbar = () => {
    const {queryParameters, setQueryParam} = useQueryParams();

    const {currentUser} = useCurrentUser();

    const selectedDepartment = useMemo(() => {
        return currentUser.departments.find(
            department => String(department.id) === queryParameters.department__id
        ) || null;
    }, [currentUser.departments, queryParameters.department__id]);

    const setDepartmentClb = (department: Department | null) => {
        if (department) {
            setQueryParam('department__id', String(department.id))
        } else {
            setQueryParam('department__id', '')
        }
    };

    const switchHandle = () => {
        if (queryParameters.showSum) {
            setQueryParam("showSum", "");
        } else {
            setQueryParam("showSum", "1");
        }
    }

    return (
        <AppNavbar>
            <AppSelect
                variant={'select'}
                noInput
                value={selectedDepartment}
                label={'Отдел'}
                options={currentUser.departments}
                getOptionLabel={item => item ? item.name : ""}
                onSelect={setDepartmentClb}
                colorScheme={'darkInput'}
            />

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