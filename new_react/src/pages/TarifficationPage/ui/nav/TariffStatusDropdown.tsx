import React, {useMemo, useState} from "react";

import {AppDropdown} from "@shared/ui";
import {useAppQuery} from "@shared/hooks";


const TARIFF_STATUSES: { [key: string]: string } = {
    'all': 'Все тарификации',
    'proposed': 'Предложенные в ожидании',
    'non_tariff': 'Без тарификации',
    'with_tariff': 'Тарифицированные',
}

export const TariffStatusDropdown = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const [currentStatus, setCurrentStatus] = useState<string>(
        queryParameters.tariff_status && queryParameters.tariff_status in TARIFF_STATUSES ?
            TARIFF_STATUSES[queryParameters.tariff_status as keyof typeof TARIFF_STATUSES]
            :
            TARIFF_STATUSES.all
    );

    const statuses = useMemo(() => (
        Object.values(TARIFF_STATUSES)
    ), []);

    const setStatusClb = (status: string) => {
        setCurrentStatus(status);
        if (status !== TARIFF_STATUSES.all) {
            const newValue = Object.keys(TARIFF_STATUSES).find(key => TARIFF_STATUSES[key] === status);
            setQueryParam('tariff_status', newValue || "")
        } else {
            setQueryParam('tariff_status', '')
        }
    };

    return (
        <AppDropdown
            selected={currentStatus}
            active={currentStatus !== TARIFF_STATUSES.all}
            items={statuses}
            onSelect={setStatusClb}
        />
    );
};
