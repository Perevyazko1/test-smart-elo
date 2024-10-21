import React from "react";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";

import {AppTooltip} from "@shared/ui";
import {useQueryParams} from "@shared/hooks";

export const StaffClearFilters = () => {
    const {setQueryParam} = useQueryParams();

    const clearFiltersHandle = () => {
        setQueryParam('start_date', '');
        setQueryParam('end_date', '');
        setQueryParam('is_active', '');
        setQueryParam('permanent_department__id', '');
        setQueryParam('by_target_date', '');
        setQueryParam('wages_only', '');
        setQueryParam('piecework_wages', '');
    }

    return (
        <AppTooltip title={'Очистить фильтра'}>
            <button
                onClick={clearFiltersHandle}
                style={{transform: 'scale(0.8)'}}
                className={'appBtn rounded blackBtn p-1 px-2 mx-2'}
            >
                <CleaningServicesOutlinedIcon fontSize={'small'}/>
            </button>
        </AppTooltip>
    );
};
