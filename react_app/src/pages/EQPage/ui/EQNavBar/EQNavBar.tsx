import React, {memo} from 'react';
import {useSelector} from "react-redux";

import logo from 'shared/assets/images/SZMK Logo White Horizontal 141x55.png';
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {getEmployeeIsBoss} from "entities/Employee";
import {eqActions} from "../../model/slice/eqSlice";
import {EqSetSeriesSize} from "./EQSetSeriesSize";
import {EqSetProject} from "./EQSetProject";
import {EqSetViewMode} from "./EQSetViewMode";
import {EQSetDepartment} from "./EQSetDepartment";


export const EqNavBar = memo(() => {
    const employeeIsBoss = useSelector(getEmployeeIsBoss)
    const dispatch = useAppDispatch()

    const set_default_filters = () => {
        dispatch(eqActions.setDefaultFilters())
    }

    return (
        <section
            className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
            style={{height: "7vh"}}
        >
            <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>

            <EQSetDepartment className={"my-auto mx-2"}/>

            <EqSetProject className={"my-auto mx-2"}/>

            {
                employeeIsBoss
                &&
                <EqSetViewMode className={"my-auto mx-2"}/>
            }

            <EqSetSeriesSize className={"my-auto mx-2"}/>

            <button
                className="btn btn-outline-light btn-sm d-xl-flex
                justify-content-xl-center align-items-xl-center my-auto ms-2"
                type="button"
                style={{height: "38px", width: "60px"}}
                onClick={() => set_default_filters()}
            >
                <i className="fas fa-sync-alt fs-5 d-xl-flex align-items-xl-center py-xl-0 mx-xl-0 me-xl-0"/>
            </button>

            <UserInfoWithRouts className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}/>

        </section>
    );
});