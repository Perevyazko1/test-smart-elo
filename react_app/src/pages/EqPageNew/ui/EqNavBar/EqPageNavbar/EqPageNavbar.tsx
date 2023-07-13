import React, {memo, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Nav} from "react-bootstrap";

import {getCurrentDepartment} from "entities/Employee";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";

import {EqSetDepartment} from "../EqSetDepartment/EqSetDepartment";
import {EqSetViewMode} from "../EqSetViewMode/EqSetViewMode";
import {EqSetProject} from "../EqSetProject/EqSetProject";
import {EqSetSeriesSize} from "../EqSetSeriesSize/EqSetSeriesSize";
import {EqUpdatePageBtn} from "../EqUpdatePageBtn/EqUpdatePageBtn";
import {fetchEqFilters} from "../../../model/service/filtersApi/fetchEqFilters";
import {EqWeekBlock} from "../../EqDesktopContent/EqWeekBlock/EqWeekBlock";


interface EqPageNavbarProps {
    isDesktop: boolean;
}


export const EqPageNavbar = memo((props: EqPageNavbarProps) => {
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

    const positionStile = 'ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1'

    return (
        <AppNavbar>
            <Nav className="me-auto">
                <EqSetDepartment
                    className={positionStile}
                    active
                />
                <EqSetViewMode
                    className={positionStile}
                />
                <EqSetProject
                    mode={projectMode}
                    callback={() => setProjectMode(projectMode === 'all' ? 'actual' : 'all')}
                    className={positionStile}
                />

                <EqSetSeriesSize
                    className={positionStile}
                />

                <EqUpdatePageBtn
                    className={positionStile + ' bg-body-tertiary px-3'}
                />

            </Nav>

            <Nav>
                <UserInfoWithRouts
                    className={positionStile}
                    active
                />
            </Nav>

            {!props.isDesktop && <EqWeekBlock/>}
        </AppNavbar>
    );
});