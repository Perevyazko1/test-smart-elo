import React, {memo, useCallback, useEffect} from 'react';
import {useSelector} from "react-redux";

import {getCurrentDepartment} from "entities/Employee";
import {OrderProductModal} from "widgets/OrderProductInfo";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import 'shared/assets/fonts/fontawesome-all.min.css';

import {eqActions, eqReducer} from "../model/slice/eqSlice";
import {fetchAwaitList} from "../model/service/fetchAwaitList/fetchAwaitList";
import {getEqUpdated} from "../model/selectors/getEqUpdated/getEqUpdated";
import {fetchInWorkList} from "../model/service/fetchInWorkList/fetchInWorkList";
import {fetchProjectFilters} from "../model/service/fetchProjects/fetchProjects";
import {EqNavBar} from "./EQNavBar/EQNavBar";
import {EqAwaitBlock} from "./EQAwaitBlock/EqAwaitBlock";
import {EqInWorkBlock} from "./EQInWorkBlock/EqInWorkBlock";
import {EqWeekBlock} from "./EQWeekBlock/EQWeekBlock";
import {EqReadyBlock} from "./EQReadyBlock/EqReadyBlock";
import {getCurrentProject} from "../model/selectors/getCurrentProject/getCurrentProject";
import {fetchViewModsList} from "../model/service/fetchViewMods/fetchViewMods";
import {getCurrentViewMod} from "../model/selectors/getCurrentViewMod/getCurrentViewMod";
import {getShowCardInfo} from "../model/selectors/getShowCardInfo/getShowCardInfo";


const initialReducers: ReducersList = {
    eq: eqReducer
}

const EqPage = memo(() => {
    const dispatch = useAppDispatch()
    const eqUpdated = useSelector(getEqUpdated)
    const currentDepartment = useSelector(getCurrentDepartment)
    const current_project = useSelector(getCurrentProject)
    const view_mode = useSelector(getCurrentViewMod)
    const showCardInfo = useSelector(getShowCardInfo)

    useEffect(() => {
        if (currentDepartment?.number) {
            dispatch(fetchAwaitList({
                department_number: currentDepartment.number,
                project: current_project,
                pin_code: 123123,
                view_mode: view_mode.key,
                series_size: 1
            }))
            dispatch(fetchInWorkList({
                department_number: currentDepartment.number,
                project: current_project,
                pin_code: 123123,
                view_mode: view_mode.key,
                series_size: 1
            }))
            dispatch(fetchProjectFilters({}))
            dispatch(fetchViewModsList({}))
        }
    }, [view_mode, current_project, currentDepartment, dispatch, eqUpdated])

    const hide_card_info = useCallback(() => {
        dispatch(eqActions.clearCardInfo())
    }, [dispatch])

    return (
        <DynamicModuleLoader reducers={initialReducers}>

            {showCardInfo && <OrderProductModal onHide={hide_card_info} order_product={showCardInfo}/>}

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