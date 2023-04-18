import React, {Suspense, useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";

import {LoginPage} from "pages/LoginPage";
import {EQPage} from "pages/EQPage";
import {Loader} from "shared/ui/Loader/Loader";
import {newWsConnection} from "shared/ws_api/newWsConnection";
import {employeeActions, getCurrentDepartment, getEmployeeAuthData} from "entities/Employee";
import {getEmployeeInited} from "entities/Employee";
import {getEmployeePinCode} from "entities/Employee";

import './styles/App.scss'


function App() {
    const dispatch = useDispatch()
    const authData = useSelector(getEmployeeAuthData)
    const employee_inited = useSelector(getEmployeeInited)
    const pin_code = useSelector(getEmployeePinCode)
    const current_department = useSelector(getCurrentDepartment)

    useEffect(() => {
        if (!employee_inited) {
            dispatch(employeeActions.initAuthData())
        }
        if (pin_code && current_department) {
            newWsConnection(pin_code, current_department.number, dispatch)
        }
    }, [employee_inited, pin_code, current_department, dispatch])

    if (authData) {
        return (
            <Suspense fallback={<Loader/>}>
                <EQPage/>
            </Suspense>
        )
    }

    return (
        <Suspense fallback={<Loader/>}>
            <LoginPage/>
        </Suspense>
    );
}

export default App;
