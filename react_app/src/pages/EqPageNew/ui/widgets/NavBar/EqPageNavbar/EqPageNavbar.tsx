import React, {memo} from 'react';
import {Nav} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/newUI/AppNavbar/AppNavbar";

import {EqSetDepartment} from "../EqSetDepartment/EqSetDepartment";
import {EqSetViewMode} from "../EqSetViewMode/EqSetViewMode";
import {EqSetProject} from "../EqSetProject/EqSetProject";
import {EqSetSeriesSize} from "../EqSetSeriesSize/EqSetSeriesSize";
import {EqUpdatePageBtn} from "../EqUpdatePageBtn/EqUpdatePageBtn";


export const EqPageNavbar = memo(() => {
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