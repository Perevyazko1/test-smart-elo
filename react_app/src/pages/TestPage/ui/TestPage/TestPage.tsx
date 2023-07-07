import React, {memo, Suspense, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {useMediaQuery} from 'react-responsive';
import {Container, Nav} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {getPaginationSize} from "shared/api/configs";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {eqPageReducer} from "../../model/slice/eqPageSlice";
import {getEqPageCards} from "../../model/selectors/getEqPageCards/getEqPageCards";
import {getEqPageHasUpdated} from "../../model/selectors/getEqPageParams/getEqPageParams";
import {fetchEqCards} from "../../model/service/fetchEqCards/fetchEqCards";
import {MobileDesignAsync} from "../MobileDesign/MobileDesign.async";
import {Loader} from "../../../../shared/ui/Loader/Loader";
import {DesktopDesignAsync} from "../DesktopDesign/DesktopDesign.async";


const reducers: ReducersList = {
    'eqPage': eqPageReducer,
}


const TestPage = memo(() => {
    const isDesktopOrLaptop = useMediaQuery({minDeviceWidth: 1201});

    return (
        <DynamicModuleLoader reducers={reducers} removeAfterUnmount>

            <Container style={{width: "100vw", height: "100vh", background: "var(--bs-gray-300)"}}
                       className={'m-0 p-0'}
                       fluid
                       data-bs-theme={'dark'}
            >
                <AppNavbar>
                    <Nav className="me-auto">

                    </Nav>
                    <Nav>
                        <UserInfoWithRouts/>
                    </Nav>
                </AppNavbar>

                {isDesktopOrLaptop
                    ?
                    <Suspense fallback={<Loader/>}>
                        <DesktopDesignAsync/>
                    </Suspense>
                    :
                    <Suspense fallback={<Loader/>}>
                        <MobileDesignAsync/>
                    </Suspense>
                }
            </Container>
        </DynamicModuleLoader>
    );
});

export default TestPage;