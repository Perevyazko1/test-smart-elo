import {useCurrentUser} from "@shared/hooks";
import {useEffect, useMemo, useState} from "react";
import {$axiosAPI} from "@shared/api";
import {Employee} from "@entities/Employee";
import {CURRENT_USER} from "@shared/consts";
import {AxiosError} from "axios";
import {AppDropdown} from "@shared/ui";

export const EqDepWidget = () => {
    const {currentUser, setCurrentUser} = useCurrentUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [department, setDepartment] = useState(() => currentUser?.current_department?.name ?? '');

    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );


    useEffect(() => {
        if (department !== currentUser.current_department.name) {
            let isMounted = true;
            setIsLoading(true);
            const fetchData = async () => {
                try {
                    const targetDepartment = currentUser.departments.find(dep => dep.name === department)
                    if (!targetDepartment) {
                        setError("Не корректный отдел пользователя");
                        return;
                    }

                    const response = await $axiosAPI.post<Employee>('/staff/change_current_department/', {
                        department_number: targetDepartment?.number,
                    });

                    if (isMounted) {
                        const localUser = localStorage.getItem(CURRENT_USER);
                        if (localUser) {
                            localStorage.setItem(CURRENT_USER, JSON.stringify(response.data));
                        }
                        setCurrentUser(response.data);
                    }
                } catch (error) {
                    if (isMounted) {
                        if (error instanceof AxiosError) {
                            if (error.response?.data) {
                                setError(error.response.data)
                            }
                        } else setError('Неопознанная ошибка')
                    }
                }
            };

            fetchData().then(() => setIsLoading(false));

            return () => {
                isMounted = false;
            };
        }
    }, [currentUser.current_department.name, currentUser.departments, department, setCurrentUser]);

    if (isLoading) {
        return (<div>Загрузка...</div>)
    }
    if (error) {
        return (<div>{error}</div>)
    }

    return (
        <AppDropdown
            selected={department}
            items={departments}
            onSelect={setDepartment}
        />
    );
};
