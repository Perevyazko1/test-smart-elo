import React, {useMemo} from "react";

import {useAppQuery} from "@shared/hooks";
import {AppSelect, AppTooltip} from "@shared/ui";


export const StaffWagesTypeFilter = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const options = [
        'Сдельщики',
        'Окладники',
    ]

    const getValue = useMemo(() => {
        if (queryParameters.piecework_wages === 'false') {
            return "Окладники";
        } else if (queryParameters.piecework_wages === 'true') {
            return "Сдельщики";
        }
        return null;
    }, [queryParameters.piecework_wages]);

    const setValue = (option: string | null) => {
        if (option === 'Сдельщики') {
            setQueryParam('piecework_wages', 'true');
        } else if (option === 'Окладники') {
            setQueryParam('piecework_wages', 'false');
        } else {
            setQueryParam('piecework_wages', '');
        }
    }

    return (
         <AppTooltip title={'Фильтр по отделу постоянного базирования сотрудника'}>
            <AppSelect
                noInput
                variant={'select'}
                label={'Форма оплаты'}
                style={{width: 150}}
                value={getValue}
                colorScheme={'darkInput'}
                options={options}
                onSelect={setValue}
            />
        </AppTooltip>
    );
};
