import React, {useEffect, useMemo, useState} from "react";
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';

import {AppNavbar} from "@widgets/AppNavbar";
import {AppInput, AppSelect, AppTooltip} from "@shared/ui";
import {useCurrentUser, useDebounce, useQueryParams} from "@shared/hooks";
import {Department, useDepartmentList} from "@entities/Department";
import {AssignmentStatus, assignmentStatusOptions, getAssignmentStatusName} from "@entities/Assignment";


export const AssignmentNavBar = () => {
    const {queryParameters, setQueryParam} = useQueryParams();
    const {currentUser} = useCurrentUser();

    const [seriesIdInput, setSeriesIdInput] = useState<string>(queryParameters.order_product__series_id || '')
    const {data, isLoading} = useDepartmentList({});
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
        return data?.find(item => item.id === Number(queryParameters.department__id)) || null;
    }, [data, queryParameters.department__id]);

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
        <AppNavbar>
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
                isLoading={isLoading}
                value={selectedDepartment}
                label={'Отдел'}
                options={data?.filter(item => currentUser.departments.includes(item.id)) || []}
                getOptionLabel={item => item ? item.name : ""}
                onSelect={setDepartmentClb}
                colorScheme={'darkInput'}
            />

            <AppTooltip title={'Отфильтровать по номеру серии или номеру заказа'}>
                <AppInput placeholder={'Номер серии'}
                          style={{maxWidth: "200px", fontSize: '10px'}}
                          className={'mx-2'}
                          onChange={(event) => setSeriesIdInput(event.target.value)}
                          value={seriesIdInput}
                />
            </AppTooltip>

            <AppTooltip title={'Очистить фильтра'}>
                <button
                    onClick={clearFiltersHandle}
                    className={'appBtn rounded blackBtn px-2 py-1'}
                >
                    <CleaningServicesOutlinedIcon fontSize={'small'}/>
                </button>
            </AppTooltip>

        </AppNavbar>
    );
};
