import {useMemo, useState} from "react";
import {AxiosError} from "axios";

import {useAppDispatch, useCurrentUser} from "@shared/hooks";
import {$axiosAPI} from "@shared/api";
import {Employee} from "@entities/Employee";
import {AppSelect} from "@shared/ui";
import {eqPageActions} from "@pages/EqPage";
import {Department, useDepartmentList} from "@entities/Department";

export const EqDepWidget = () => {
    const {currentUser, setCurrentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {data, isLoading: depIsLoading} = useDepartmentList({});

    const fetchData = async (depNumber: number) => {
        try {
            const response = await $axiosAPI.post<Employee>('/staff/change_current_department/', {
                department_number: depNumber,
            });
            dispatch(eqPageActions.filtersInited(false));
            dispatch(eqPageActions.filtersReady(false));

            setCurrentUser(response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data) {
                    setError(error.response.data)
                }
            } else setError('Неопознанная ошибка')
        }
    };

    const setDepClb = (dep: Department | null) => {
        if (dep && dep.number !== currentUser.current_department_details?.number) {
            setIsLoading(true);
            fetchData(dep.number).then(() => {
                setIsLoading(false);
            });
        }
    }

    const departments = useMemo(() => {
        return data?.filter(item => currentUser.departments.includes(item.id)).sort(
            (a, b) => a.ordering - b.ordering
        )
    }, [currentUser.departments, data]);

    if (error || !currentUser.current_department) {
        return (<div>{error}</div>)
    }

    return (
        <AppSelect
            noInput
            variant={'dropdown'}
            isLoading={isLoading || depIsLoading}
            style={{width: 125}}
            label={'Отдел'}
            value={currentUser.current_department_details}
            options={departments}
            getOptionLabel={item => item ? item.name : 'Выберите отдел'}
            colorScheme={'darkInput'}
            onSelect={setDepClb}
        />
    );
};
