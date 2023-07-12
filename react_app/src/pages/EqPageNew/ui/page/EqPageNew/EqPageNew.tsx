import React, {Suspense} from "react";
import {useMediaQuery} from "react-responsive";
import {Container} from "react-bootstrap";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {Loader} from "shared/ui/Loader/Loader";

import {EqDesktopContentAsync} from "../EqDesktopContent/EqDesktopContent/EqDesktopContent.async";
import {EqMobileContentAsync} from "../EqMobileContent/EqMobileContent.async";
import {eqFiltersReducer} from "../../../model/slice/eqFiltersSlice";
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

                <EqPageNavbar isDesktop={isDesktopOrLaptop}/>

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