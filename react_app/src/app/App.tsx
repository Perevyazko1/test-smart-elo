import React, {Suspense, useEffect, useRef} from 'react';
import {useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";

import {LoginPage} from "pages/LoginPage";
import {TaxControlPage} from "pages/TaxControlPage";
import {ForbiddenPage} from "pages/ForbiddenPage";
import {EqPageNew} from "pages/EqPageNew";
import {authByPinCode} from "features/AuthByPinCode";
import {NotificationWidget} from "widgets/Notification";

import {Loader} from "shared/ui/Loader/Loader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {USER_LOCALSTORAGE_KEY} from "shared/const/localstorage";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {
    employee,
    employeeActions,
    EmployeePermissions,
    getCurrentDepartment,
    getEmployeeAuthData,
    getEmployeeHasPermissions,
    getEmployeeInited,
    getEmployeePinCode,
} from "entities/Employee";

import './styles/App.scss';
import 'shared/assets/fonts/fontawesome-all.min.css';



function App() {
    const dispatch = useAppDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const employee_inited = useSelector(getEmployeeInited)
    const pin_code = useSelector(getEmployeePinCode)
    const current_department = useSelector(getCurrentDepartment)

    const tariffPagePermission = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.TARIFICATION_PAGE
    ]))
    const eloPagePermission = useSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_PAGE
    ]))

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
                            {eloPagePermission &&
                                <Route path="/" element={
                                    <Suspense fallback={<Loader/>}>
                                        <EqPageNew/>
                                    </Suspense>
                                }/>
                            }

                            {tariffPagePermission &&
                                <Route path="/tax_control" element={
                                    <Suspense fallback={<Loader/>}>
                                        <TaxControlPage/>
                                    </Suspense>
                                }/>
                            }

                            {eloPagePermission
                                ?
                                <Route path="/*" element={
                                    <Suspense fallback={<Loader/>}>
                                        <EqPageNew/>
                                    </Suspense>
                                }/>
                                :
                                <Route path="/*" element={
                                    <Suspense fallback={<Loader/>}>
                                        <ForbiddenPage/>
                                    </Suspense>
                                }/>
                            }
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
