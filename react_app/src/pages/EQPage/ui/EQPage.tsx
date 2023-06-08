import React, {memo, useEffect, useState} from 'react';
import {useSelector} from "react-redux";

import {getCurrentDepartment} from "entities/Employee";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {eqReducer} from "../model/slice/eqSlice";
import {EqNavBar} from "./EQNavBar/EQNavBar";
import {EqAwaitBlock} from "./EQAwaitBlock/EqAwaitBlock";
import {EqInWorkBlock} from "./EQInWorkBlock/EqInWorkBlock";
import {EqWeekBlock} from "./EQWeekBlock/EQWeekBlock";
import {EqReadyBlock} from "./EQReadyBlock/EqReadyBlock";
import {fetchViewModsList} from "../model/service/fetchViewMods/fetchViewMods";


const initialReducers: ReducersList = {
    eq: eqReducer,
}

const EqPage = memo(() => {
    const dispatch = useAppDispatch()
    const current_department = useSelector(getCurrentDepartment)

    const [upperHeight, setUpperHeight] = useState(44);
    const [lowerHeight, setLowerHeight] = useState(44);

    useEffect(() => {
        if (current_department?.number) {
            dispatch(fetchViewModsList({
                department_number: current_department.number
            }))
        }
    }, [current_department, dispatch])

    const adjustHeight = (y: number) => {
        let vh = y * 100 / window.innerHeight;
        if (vh - 7 > 0 && 95 - vh > 0) {
            setUpperHeight(vh - 7)
            setLowerHeight(95 - vh)
        } else if (vh - 7 <= 0) {
            setUpperHeight(0)
            setLowerHeight(88)
        } else if (95 - vh <= 0) {
            setUpperHeight(88)
            setLowerHeight(0)
        }
        console.log(vh - 7, 100 - vh)
    }


    return (
        <DynamicModuleLoader reducers={initialReducers}>

            <div className="container-fluid p-0" style={{height: "100vh", background: "#f8f9fa"}}>
                <EqNavBar/>

                <section style={{height: "93vh", background: "#929292"}}>
                    <div className="row h-100 m-0">

                        {/*<--------------- Левый блок --------------->*/}
                        <div className="col-xl-6 p-0">

                            {/*<--------------- В работе блок --------------->*/}
                            <EqInWorkBlock verticalHeight={upperHeight}/>

                            {/*<--------------- Недели блок --------------->*/}
                            <EqWeekBlock adjustHeight={adjustHeight}/>

                            {/*<--------------- Готовые изделия блок --------------->*/}
                            <EqReadyBlock verticalHeight={lowerHeight}/>

                        </div>

                        {/*<--------------- Правый блок --------------->*/}
                        <div className="col-xl-6 p-0">
                            <EqAwaitBlock/>
                        </div>

                    </div>
                </section>
            </div>
        </DynamicModuleLoader>
    );
});

export default EqPage;