import React, {Suspense} from "react";
import {useMediaQuery} from "react-responsive";
import {Container, Nav} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/newUI/AppNavbar/AppNavbar";
import {Loader} from "shared/ui/Loader/Loader";

import {EqDesktopContentAsync} from "../EqDesktopContent/EqDesktopContent.async";
import {EqMobileContentAsync} from "../EqMobileContent/EqMobileContent.async";

const EqPageNew = () => {
    const isDesktopOrLaptop = useMediaQuery({minDeviceWidth: 1201});

    return (
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
    );
};

export default EqPageNew;