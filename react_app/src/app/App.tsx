import React, {Suspense, useEffect, useRef} from 'react';
import {Routes} from "react-router-dom";

import {LoginPage} from "pages/LoginPage";
import {authByPinCode} from "features/AuthByPinCode";
import {NotificationWidget} from "widgets/Notification";
import {
    employee,
    employeeActions,
    getCurrentDepartment,
    getEmployeeAuthData,
    getEmployeeInited,
    getEmployeePinCode,
} from "entities/Employee";

import {Loader} from "shared/ui/Loader/Loader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {USER_LOCALSTORAGE_KEY} from "shared/const/localstorage";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import 'shared/assets/fonts/fontawesome-all.min.css';
import {usePermittedRoutes} from "shared/lib/hooks/usePermittedRoutes/usePermittedRoutes";

import './styles/App.scss';

function App() {
    const dispatch = useAppDispatch();
    const authData = useAppSelector(getEmployeeAuthData);
    const employee_inited = useAppSelector(getEmployeeInited);
    const pin_code = useAppSelector(getEmployeePinCode);
    const current_department = useAppSelector(getCurrentDepartment);
    const permittedRoutes = usePermittedRoutes();

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const employee = localStorage.getItem(USER_LOCALSTORAGE_KEY);

        if (employee) {
            const user: employee = JSON.parse(employee)
            if (user.pin_code) {
                dispatch(authByPinCode({pin_code: user.pin_code, rememberMe: true}))
            }
        } else {
            dispatch(employeeActions.initAuthData())
        }
    }, [dispatch])

    useEffect(() => {
        if (pin_code && current_department) {
            if (socketRef) {
                socketRef.current?.close()
                socketRef.current = null
            }
            socketRef.current = newWsConnection(pin_code, current_department.number, dispatch)
        }
    }, [pin_code, current_department, dispatch])

    return (
        <>
            <NotificationWidget/>
            {employee_inited
                ?
                <>
                    {authData
                        ?

                        <Routes>
                            {permittedRoutes}
                        </Routes>

                        :

                        <Suspense fallback={<Loader/>}>
                            <LoginPage/>
                        </Suspense>
                    }
                </>
                :
                <Loader/>
            }
        </>
    );
}

export default App;
