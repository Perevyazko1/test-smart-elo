import React, {Suspense, useEffect} from 'react';
import './styles/App.scss'

import {LoginPage} from "pages/LoginPage";
import {useDispatch, useSelector} from "react-redux";
import {employeeActions, getEmployeeAuthData} from "../entities/Employee";
import {Loader} from "../shared/ui/Loader/Loader";
import {EQPage} from "../pages/EQPage/index.";

function App() {
    const dispatch = useDispatch()
    const authData = useSelector(getEmployeeAuthData)

    useEffect(() => {
        dispatch(employeeActions.initAuthData())
    }, [dispatch])

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
