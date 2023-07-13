import React, {Suspense, useEffect, useRef} from 'react';
import {Route, Routes} from "react-router-dom";

import {LoginPage} from "pages/LoginPage";
import {TaxControlPage} from "pages/TaxControlPage";
import {ForbiddenPage} from "pages/ForbiddenPage";
import {EqPageNew} from "pages/EqPageNew";
import {authByPinCode} from "features/AuthByPinCode";
import {NotificationWidget} from "widgets/Notification";
import {TestPage} from "pages/TestPage";
import {AssignmentPage} from "pages/AssignmentPage";

import {Loader} from "shared/ui/Loader/Loader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {USER_LOCALSTORAGE_KEY} from "shared/const/localstorage";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
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
import 'shared/assets/fonts/fontawesome-all.min.css';

import './styles/App.scss';

function App() {
    const dispatch = useAppDispatch()
    const authData = useAppSelector(getEmployeeAuthData)
    const employee_inited = useAppSelector(getEmployeeInited)
    const pin_code = useAppSelector(getEmployeePinCode)
    const current_department = useAppSelector(getCurrentDepartment)

    const tariffPagePermission = useAppSelector(getEmployeeHasPermissions([
        EmployeePermissions.TARIFICATION_PAGE
    ]))
    const eloPagePermission = useAppSelector(getEmployeeHasPermissions([
        EmployeePermissions.ELO_PAGE
    ]))

    const adminPermission = useAppSelector(getEmployeeHasPermissions([
        EmployeePermissions.ADMIN
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

                            {adminPermission &&
                                <Route path="/test" element={
                                    <Suspense fallback={<Loader/>}>
                                        <TestPage/>
                                    </Suspense>
                                }/>
                            }

                            {adminPermission &&
                                <Route path="/assignments" element={
                                    <Suspense fallback={<Loader/>}>
                                        <AssignmentPage/>
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
