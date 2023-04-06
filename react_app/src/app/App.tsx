import React, {Suspense, useCallback, useEffect} from 'react';
import './styles/App.scss'

import {LoginPage} from "pages/LoginPage";
import {useDispatch, useSelector} from "react-redux";
import {employeeActions, getEmployeeAuthData} from "../entities/Employee";
import {Button, ButtonTypes} from "../shared/ui/Button/Button";
import {Loader} from "../shared/ui/Loader/Loader";

function App() {
    const dispatch = useDispatch()
    const authData = useSelector(getEmployeeAuthData)

    useEffect(() => {
        dispatch(employeeActions.initAuthData())
    }, [dispatch])

    const logout = useCallback(() => {
        dispatch(employeeActions.logout())
    }, [dispatch])

    if (authData) {
        return (
            <div>
                <Button type={ButtonTypes.BUTTON} onClick={logout}>
                    {authData.first_name}
                </Button>
            </div>
        )
    }

    return (
        // TODO сделать красивый загрузчик
        <Suspense fallback={<Loader/>}>
            <LoginPage/>
        </Suspense>
    );
}

export default App;
