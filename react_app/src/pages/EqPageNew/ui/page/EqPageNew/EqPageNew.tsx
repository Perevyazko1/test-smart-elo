import React, {Suspense} from "react";
import {useMediaQuery} from "react-responsive";
import {Container, Nav} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {Loader} from "shared/ui/Loader/Loader";

import {EqDesktopContentAsync} from "../EqDesktopContent/EqDesktopContent/EqDesktopContent.async";
import {EqMobileContentAsync} from "../EqMobileContent/EqMobileContent.async";
import {EqSetDepartment} from "../../widgets/NavBar/EqSetDepartment/EqSetDepartment";
import {EqSetViewMode} from "../../widgets/NavBar/EqSetViewMode/EqSetViewMode";
import {eqFiltersReducer} from "../../../model/slice/eqFiltersSlice";
import {EqSetProject} from "../../widgets/NavBar/EqSetProject/EqSetProject";
import {EqSetSeriesSize} from "../../widgets/NavBar/EqSetSeriesSize/EqSetSeriesSize";
import {EqUpdatePageBtn} from "../../widgets/NavBar/EqUpdatePageBtn/EqUpdatePageBtn";
import {EqPageNavbar} from "../../widgets/NavBar/EqPageNavbar/EqPageNavbar";


const initialReducers: ReducersList = {
    eqFilters: eqFiltersReducer,
}


const EqPageNew = () => {
    const isDesktopOrLaptop = useMediaQuery({minDeviceWidth: 1201});

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Container style={{width: "100vw", height: "100vh", background: "var(--bs-gray-300)"}}
                       className={'m-0 p-0'}
                       fluid
                       data-bs-theme={'dark'}
            >

                <EqPageNavbar/>

                {isDesktopOrLaptop ?
                    <Suspense fallback={<Loader/>}>
                        <EqDesktopContentAsync/>
                    </Suspense>
                    :
                    <Suspense fallback={<Loader/>}>
                        <EqMobileContentAsync/>
                    </Suspense>
                }

            </Container>
        </DynamicModuleLoader>
    );
};

export default EqPageNew;