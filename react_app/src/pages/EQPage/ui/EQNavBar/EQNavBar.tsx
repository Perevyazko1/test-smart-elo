import React, {memo, useCallback} from 'react';
import {useSelector} from "react-redux";

import logo from 'shared/assets/images/SZMK Logo White Horizontal 141x55.png';
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {employeeActions, getEmployeeAuthData} from "entities/Employee";
import {eqActions} from "../../model/slice/eqSlice";
import {EqSetSeriesSize} from "./EQSetSeriesSize";
import {EqSetProject} from "./EQSetProject";
import {EqSetViewMode} from "./EQSetViewMode";
import {EQSetDepartment} from "./EQSetDepartment";


export const EqNavBar = memo(() => {
    const employee = useSelector(getEmployeeAuthData)
    const dispatch = useAppDispatch()

    const logout = useCallback(() => {
        dispatch(employeeActions.logout())
    }, [dispatch])

    const update_eq = () => {
        dispatch(eqActions.eqUpdated())
    }

    return (
        <section
            className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
            style={{height: "7vh"}}
        >
            <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>

            <EQSetDepartment className={"my-auto mx-2"}/>

            <EqSetProject className={"my-auto mx-2"}/>

            <EqSetViewMode className={"my-auto mx-2"}/>

            <EqSetSeriesSize className={"my-auto mx-2"}/>

            <button
                className="btn btn-outline-light btn-sm d-xl-flex
                justify-content-xl-center align-items-xl-center my-auto ms-2"
                type="button"
                style={{height: "38px", width: "60px"}}
                onClick={update_eq}
            >
                <i className="fas fa-sync-alt fs-5 d-xl-flex align-items-xl-center py-xl-0 mx-xl-0 me-xl-0"/>
            </button>



            <h6 className="text-light d-xl-flex justify-content-xl-center align-items-xl-center"
                style={{marginLeft: "auto", height: "100%"}}>
                {employee?.first_name + " " + employee?.last_name}
            </h6>

            <h4 className="text-light d-xl-flex justify-content-xl-center align-items-xl-center ps-xl-0 mx-xl-3"
                style={{height: "100%"}}>
                |
            </h4>
            <div onClick={logout}>
                <h6 className="text-light d-xl-flex justify-content-xl-center align-items-xl-center me-xl-4"
                    style={{height: "100%"}}>
                    Выйти
                </h6>
            </div>


        </section>
    );
});