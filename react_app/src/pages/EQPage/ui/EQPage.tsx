import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";

import {getEmployeeAuthData} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import 'shared/assets/fonts/fontawesome-all.min.css';

import {fetchEqOrderProductList, StatusList,} from "../model/service/fetchEqOrderProductList/fetchEqOrderProductList";
import {eqReducer} from "../model/slice/eqSlice";
import {EqNavBar} from "./EQNavBar/EQNavBar";
import {EqAwaitBlock} from "./EQAwaitBlock/EqAwaitBlock";
import {EqInWorkBlock} from "./EQInWorkBlock/EqInWorkBlock";
import {EqWeekBlock} from "./EQWeekBlock/EQWeekBlock";
import {EqReadyBlock} from "./EQReadyBlovk/EqReadyBlock";
import {getEqUpdated} from "../model/selectors/getEqUpdated/getEqUpdated";


const initialReducers: ReducersList = {
    eq: eqReducer
}

const EqPage = memo(() => {
    const employee = useSelector(getEmployeeAuthData)
    const eqUpdated = useSelector(getEqUpdated)

    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchEqOrderProductList({
            status_list: StatusList.AWAIT_LIST,
            department_number: employee?.current_department?.number
        }))

        dispatch(fetchEqOrderProductList({
            status_list: StatusList.IN_WORK_LIST,
            department_number: employee?.current_department?.number
        }))

        dispatch(fetchEqOrderProductList({
            status_list: StatusList.READY_LIST,
            department_number: employee?.current_department?.number
        }))
    }, [employee, dispatch, eqUpdated])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <div className="container-fluid p-0" style={{height: "100vh", background: "#f8f9fa"}}>
                <EqNavBar/>

                <section style={{height: "93vh", background: "#929292"}}>
                    <div className="row" style={{height: "100%", margin: "0"}}>

                        {/*<--------------- Левый блок --------------->*/}
                        <div className="col-xl-6" style={{width: "50%", padding: "0"}}>

                            {/*<--------------- В работе блок --------------->*/}
                           <EqInWorkBlock/>

                            {/*<--------------- Недели блок --------------->*/}
                            <EqWeekBlock/>

                            {/*<--------------- Готовые изделия блок --------------->*/}
                            <EqReadyBlock/>

                        </div>

                        {/*<--------------- Правый блок --------------->*/}
                            <EqAwaitBlock/>

                    </div>
                </section>
            </div>
        </DynamicModuleLoader>
    );
});

export default EqPage;