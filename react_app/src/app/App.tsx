import React, {Suspense, useEffect, useRef} from 'react';
import {useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";

import {LoginPage} from "pages/LoginPage";
import {TaxControlPage} from "pages/TaxConrtolPage";
import {EQPage} from "pages/EQPage";
import {Loader} from "shared/ui/Loader/Loader";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {
    employee,
    employeeActions,
    getCurrentDepartment,
    getEmployeeAuthData,
    getEmployeeInited,
    getEmployeePinCode,
    getEmployeeTariffAccess
} from "entities/Employee";

import './styles/App.scss';
import 'shared/assets/fonts/fontawesome-all.min.css';
import {authByPinCode} from "features/AuthByPinCode";
import {useAppDispatch} from "../shared/lib/hooks/useAppDispatch/useAppDispatch";
import {USER_LOCALSTORAGE_KEY} from "../shared/const/localstorage";


function App() {
    const dispatch = useAppDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const employee_inited = useSelector(getEmployeeInited)
    const pin_code = useSelector(getEmployeePinCode)
    const current_department = useSelector(getCurrentDepartment)
    const employeeTariffAccess = useSelector(getEmployeeTariffAccess)
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
            {employee_inited
                ?
                <>
                    {authData
                        ?
                        <Routes>
                            <Route path="/eq" element={
                                <Suspense fallback={<Loader/>}>
                                    <EQPage/>
                                </Suspense>
                            }/>

                            {employeeTariffAccess &&
                                <Route path="/tax_control" element={
                                    <Suspense fallback={<Loader/>}>
                                        <TaxControlPage/>
                                    </Suspense>
                                }/>
                            }

                            <Route path="/*" element={
                                <Suspense fallback={<Loader/>}>
                                    <EQPage/>
                                </Suspense>
                            }/>
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
