import {useMemo, useState} from "react";
import {AxiosError} from "axios";
import {Spinner} from "react-bootstrap";

import {useAppDispatch, useCurrentUser} from "@shared/hooks";
import {$axiosAPI} from "@shared/api";
import {Employee} from "@entities/Employee";
import {AppDropdown} from "@shared/ui";
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
        if (depName !== currentUser.current_department.name) {
            setIsLoading(true);
            fetchData(depName).then(() => {
                dispatch(eqPageActions.allListClear())
            });
            setIsLoading(false);
        }
    }

    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );


    if (isLoading) {
        return (
            <div className={'d-flex justify-content-center align-items-center'} style={{minWidth: '80px'}}>
                <Spinner size={'sm'}/>
            </div>
        )
    }
    if (error) {
        return (<div>{error}</div>)
    }

    return (
        <AppDropdown
            selected={currentUser.current_department.name}
            items={departments}
            onSelect={setDepClb}
        />
    );
};
