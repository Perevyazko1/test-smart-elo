import React, {memo, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Nav} from "react-bootstrap";

import {getCurrentDepartment} from "entities/Employee";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {AppNavbar} from "shared/newUI/AppNavbar/AppNavbar";

import {EqSetDepartment} from "../EqSetDepartment/EqSetDepartment";
import {EqSetViewMode} from "../EqSetViewMode/EqSetViewMode";
import {EqSetProject} from "../EqSetProject/EqSetProject";
import {EqSetSeriesSize} from "../EqSetSeriesSize/EqSetSeriesSize";
import {EqUpdatePageBtn} from "../EqUpdatePageBtn/EqUpdatePageBtn";
import {fetchEqFilters} from "../../../../model/service/filtersApi/fetchEqFilters";


export const EqPageNavbar = memo(() => {
    const dispatch = useAppDispatch();
    const [projectMode, setProjectMode] = useState<'all' | 'actual'>('actual');
    const currentDepartment = useSelector(getCurrentDepartment);

    useEffect(() => {
        if (currentDepartment) {
            dispatch(fetchEqFilters({
                mode: projectMode,
            }))
        }
    }, [dispatch, projectMode, currentDepartment])

    return (
        <AppNavbar>
            <Nav className="me-auto">
                <EqSetDepartment
                    className={'ms-xl-2 my-xl-0 my-sm-1 border border-2 rounded px-1'}
                    active
                />
                <EqSetViewMode
                    className={'ms-xl-2 my-xl-0 my-sm-1 ms-xl-3 border border-2 rounded px-1'}
                />
                <EqSetProject
                    mode={projectMode}
                    callback={() => setProjectMode(projectMode === 'all' ? 'actual' : 'all')}
                    className={'ms-xl-2 my-xl-0 my-sm-1 ms-xl-3 border border-2 rounded px-1'}
                />

                <EqSetSeriesSize
                    className={'ms-xl-2 my-xl-0 my-sm-1 ms-xl-3 border border-2 rounded px-1'}
                />

                <EqUpdatePageBtn
                    className={'ms-xl-2 my-xl-0 my-sm-1 ms-xl-3 border border-2 bg-body-tertiary'}
                />

            </Nav>

            <Nav>
                <UserInfoWithRouts
                    className={'border border-2 rounded px-1 my-sm-1 my-xl-0'}
                    active
                />
            </Nav>
        </AppNavbar>
    );
});