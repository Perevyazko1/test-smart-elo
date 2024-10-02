import React, {useEffect, useMemo, useState} from "react";
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';

import {AppNavbar} from "@widgets/AppNavbar";
import {AppInput, AppSelect} from "@shared/ui";
import {useCurrentUser, useDebounce, useQueryParams} from "@shared/hooks";
import {Department} from "@entities/Department";
import {AssignmentStatus, assignmentStatusOptions, getAssignmentStatusName} from "@entities/Assignment";

interface NavBarProps {
    showCanvas: boolean,
    setShowCanvas: (value: boolean) => void;
}

export const AssignmentNavBar = (props: NavBarProps) => {
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

    const clearFiltersHandle = () => {
        setQueryParam('order_product__series_id', '');
        setQueryParam('order_product__product__id', '');
        setQueryParam('order_product__order__project', '');
        setQueryParam('department__id', '');
        setQueryParam('status', '');
        setQueryParam('executor', '');
        setQueryParam('inspector', '');
        setSeriesIdInput('');
    }

    return (
        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
            <AppSelect
                variant={'select'}
                noInput
                value={queryParameters.status as AssignmentStatus | null}
                label={'Статус'}
                options={assignmentStatusOptions}
                getOptionLabel={getAssignmentStatusName}
                onSelect={(option) => setQueryParam('status', option || "")}
                colorScheme={'darkInput'}
            />

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
                      style={{maxWidth: "200px", fontSize: '10px'}}
                      className={'mx-2'}
                      onChange={(event) => setSeriesIdInput(event.target.value)}
                      value={seriesIdInput}
            />

            <button
                onClick={clearFiltersHandle}
                className={'appBtn rounded blackBtn px-2 py-1'}
            >
                <CleaningServicesOutlinedIcon fontSize={'small'}/>
            </button>

        </AppNavbar>
    );
};
