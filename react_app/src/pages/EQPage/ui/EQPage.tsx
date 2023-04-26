import React, {memo, useCallback, useEffect} from 'react';
import {useSelector} from "react-redux";

import {getCurrentDepartment} from "entities/Employee";
import {OrderProductModal} from "widgets/OrderProductInfo";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import 'shared/assets/fonts/fontawesome-all.min.css';

import {eqActions, eqReducer} from "../model/slice/eqSlice";
import {fetchProjectFilters} from "../model/service/fetchProjects/fetchProjects";
import {EqNavBar} from "./EQNavBar/EQNavBar";
import {EqAwaitBlock} from "./EQAwaitBlock/EqAwaitBlock";
import {EqInWorkBlock} from "./EQInWorkBlock/EqInWorkBlock";
import {EqWeekBlock} from "./EQWeekBlock/EQWeekBlock";
import {EqReadyBlock} from "./EQReadyBlock/EqReadyBlock";
import {fetchViewModsList} from "../model/service/fetchViewMods/fetchViewMods";
import {getShowCardInfo} from "../model/selectors/getShowCardInfo/getShowCardInfo";


const initialReducers: ReducersList = {
    eq: eqReducer,
}

const EqPage = memo(() => {
    const dispatch = useAppDispatch()
    const current_department = useSelector(getCurrentDepartment)
    const showCardInfo = useSelector(getShowCardInfo)

    useEffect(() => {
        if (current_department?.number) {
            dispatch(fetchProjectFilters({}))
            dispatch(fetchViewModsList({
                department_number: current_department.number
            }))
        }
    }, [current_department, dispatch])

    const hide_card_info = useCallback(() => {
        dispatch(eqActions.clearCardInfo())
    }, [dispatch])

    return (
        <DynamicModuleLoader reducers={initialReducers}>

            {showCardInfo && <OrderProductModal onHide={hide_card_info} order_product={showCardInfo}/>}

            <div className="container-fluid p-0" style={{height: "100vh", background: "#f8f9fa"}}>
                <EqNavBar/>

                <section style={{height: "93vh", background: "#929292"}}>
                    <div className="row h-100 m-0">

                        {/*<--------------- Левый блок --------------->*/}
                        <div className="col-xl-6 p-0">

                            {/*<--------------- В работе блок --------------->*/}
                            <EqInWorkBlock/>

                            {/*<--------------- Недели блок --------------->*/}
                            <EqWeekBlock/>

                            {/*<--------------- Готовые изделия блок --------------->*/}
                            <EqReadyBlock/>

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