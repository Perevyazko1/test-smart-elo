import React, {Suspense, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";

import {LoginPage} from "pages/LoginPage";
import {TaxControlPage} from "pages/TaxConrtolPage";
import {EQPage} from "pages/EQPage";
import {Loader} from "shared/ui/Loader/Loader";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {employeeActions, getCurrentDepartment, getEmployeeAuthData} from "entities/Employee";
import {getEmployeeInited} from "entities/Employee";
import {getEmployeePinCode} from "entities/Employee";

import './styles/App.scss';


function App() {
    const dispatch = useDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const employee_inited = useSelector(getEmployeeInited)
    const pin_code = useSelector(getEmployeePinCode)
    const current_department = useSelector(getCurrentDepartment)
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!employee_inited) {
            dispatch(employeeActions.initAuthData())
        }
        if (pin_code && current_department) {
            if (socketRef) {
                socketRef.current?.close()
                socketRef.current = null
            }
            socketRef.current = newWsConnection(pin_code, current_department.number, dispatch)
        }
    }, [employee_inited, pin_code, current_department, dispatch])


    return (
        <>
            {authData
                ?
                <Routes>
                    <Route path="/eq" element={
                        <Suspense fallback={<Loader/>}>
                            <EQPage/>
                        </Suspense>
                    }/>

                    <Route path="/tax_control" element={
                        <Suspense fallback={<Loader/>}>
                            <TaxControlPage/>
                        </Suspense>
                    }/>

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
    );
}

export default App;
