import React, {memo} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {TCNameFilter} from "../TCNameFilter/TCNameFilter";
import {TСDepartmentFilter} from "../TCDepartmentFilter/TCDepartmentFilter";
import {TCViewModeFilter} from "../TCViewModeFilter/TCViewModeFilter";
import {useAppDispatch} from "../../../../shared/lib/hooks/useAppDispatch/useAppDispatch";
import {taxControlActions} from "../../model/slice/taxControlPageSlice";

interface TCNavBarProps {
    className?: string
}


export const TCNavBar = memo((props: TCNavBarProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()

    const set_default_filters = () => {
        dispatch(taxControlActions.setDefaultFilters());
        dispatch(taxControlActions.hasUpdated());
    }

    const mods: Mods = {};

    return (
        <section
            className={classNames('bg-dark d-flex mb-xl-0 pb-xl-0', mods, [className])}
            style={{height: "7vh"}}
            data-bs-theme={'dark'}
            {...otherProps}
        >
            <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>


            <TСDepartmentFilter className={'my-auto me-3'}/>

            <TCViewModeFilter className={'my-auto me-3'}/>

            <TCNameFilter className={'h-50 w-auto me-3'}/>

            <button
                className="btn btn-outline-light btn-sm d-xl-flex
                justify-content-xl-center align-items-xl-center my-auto"
                type="button"
                style={{height: "38px", width: "60px"}}
                onClick={() => set_default_filters()}
            >
                <i className="fas fa-sync-alt fs-5 d-xl-flex align-items-xl-center py-xl-0 mx-xl-0 me-xl-0"/>
            </button>


            <UserInfoWithRouts
                className={'text-white pe-2 ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}
            />

        </section>
    );
});