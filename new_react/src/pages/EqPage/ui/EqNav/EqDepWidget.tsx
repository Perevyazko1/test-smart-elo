import {useMemo, useState} from "react";
import {AxiosError} from "axios";

import {useAppDispatch, useCurrentUser} from "@shared/hooks";
import {$axiosAPI} from "@shared/api";
import {Employee} from "@entities/Employee";
import {AppSelect} from "@shared/ui";
import {eqPageActions} from "@pages/EqPage";

export const EqDepWidget = () => {
    const {currentUser, setCurrentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (depName: string) => {

        try {
            const targetDepartment = currentUser.departments.find(dep => dep.name === depName)
            if (!targetDepartment) {
                setError("Не корректный отдел пользователя");
                return;
            }

            const response = await $axiosAPI.post<Employee>('/staff/change_current_department/', {
                department_number: targetDepartment?.number,
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

    const setDepClb = (depName: string) => {
        if (depName !== currentUser.current_department?.name) {
            setIsLoading(true);
            fetchData(depName).then(() => {
                setIsLoading(false);
            });
        }
    }

    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );

    if (error || !currentUser.current_department) {
        return (<div>{error}</div>)
    }

    return (
        <AppSelect
            noInput
            variant={'dropdown'}
            isLoading={isLoading}
            style={{width: 140}}
            label={'Отдел'}
            value={currentUser.current_department.name}
            options={departments}
            colorScheme={'darkInput'}
            onSelect={setDepClb}
        />
    );
};
