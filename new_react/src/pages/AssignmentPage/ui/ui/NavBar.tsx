import {AppNavbar} from "@widgets/AppNavbar";
import {AppInput, AppSelect} from "@shared/ui";
import React, {useEffect, useMemo, useState} from "react";
import {useCurrentUser, useDebounce, useQueryParams} from "@shared/hooks";
import {Department} from "@entities/Department";

interface NavBarProps {
    showCanvas: boolean,
    setShowCanvas: (value: boolean) => void;
}

export const NavBar = (props: NavBarProps) => {
    const {showCanvas, setShowCanvas} = props;

    const {queryParameters, setQueryParam} = useQueryParams();
    const {currentUser} = useCurrentUser();

    const [seriesIdInput, setSeriesIdInput] = useState<string>(queryParameters.order_product__series_id || '')

    // Дебаунсим изменение поисковой строки
    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );
    useEffect(() => {
        debouncedSetQueryParam('order_product__series_id', seriesIdInput)
        // eslint-disable-next-line
    }, [seriesIdInput]);

    const setDepartmentClb = (department: Department | null) => {
        if (department) {
            setQueryParam('department__id', String(department.id))
        } else {
            setQueryParam('department__id', '')
        }
    };

    const selectedDepartment = useMemo(() => {
        return currentUser.departments.find(
            department => String(department.id) === queryParameters.department__id
        ) || null;
    }, [currentUser.departments, queryParameters.department__id]);

    return (
        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
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

            <AppInput placeholder={'Номер серии'}
                      style={{width: "200",fontSize: '10px'}}
                      className={'mx-2'}
                      onChange={(event) => setSeriesIdInput(event.target.value)}
                value={seriesIdInput}
            />

        </AppNavbar>
    );
};
