import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import 'shared/assets/fonts/fontawesome-all.min.css';

import {eqReducer} from "../model/slice/eqSlice";
import {EqNavBar} from "./EQNavBar/EQNavBar";
import {EqAwaitBlock} from "./EQAwaitBlock/EqAwaitBlock";
import {EqInWorkBlock} from "./EQInWorkBlock/EqInWorkBlock";
import {EqWeekBlock} from "./EQWeekBlock/EQWeekBlock";
import {fetchAwaitList} from "../model/service/fetchAwaitList/fetchAwaitList";
import {getEqUpdated} from "../model/selectors/getEqUpdated/getEqUpdated";
import {fetchInWorkList} from "../model/service/fetchInWorkList/fetchInWorkList";
import {EqReadyBlock} from "./EQReadyBlock/EqReadyBlock";
import {fetchProjectFilters} from "../model/service/fetchProjects/fetchProjects";


const initialReducers: ReducersList = {
    eq: eqReducer
}

const EqPage = memo(() => {
    const dispatch = useAppDispatch()
    const eqUpdated = useSelector(getEqUpdated)

    useEffect(() => {
        dispatch(fetchAwaitList({
            department_number: 1,
            project: 'all',
            pin_code: 123123,
            view_mode: 'all',
            series_size: 1
        }))
        dispatch(fetchInWorkList({
            department_number: 1,
            project: 'all',
            pin_code: 123123,
            view_mode: 'all',
            series_size: 1
        }))
        dispatch(fetchProjectFilters({}))
    }, [dispatch, eqUpdated])

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