import React, {memo, ReactNode} from 'react';
import {Container, Navbar, Offcanvas} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";

import logo from "../../assets/images/SZMK Logo White Horizontal 900х352.png";

interface AppNavbarProps {
    className?: string
    children?: ReactNode
}


export const AppNavbar = memo((props: AppNavbarProps) => {
    const {
        className,
        children,
    } = props

    const mods: Mods = {};

    return (
        <Navbar expand="xl"
                className={classNames('bg-body-tertiary p-0', mods, [className])}
                style={{height: "55px"}}
                data-bs-theme={'dark'}
        >
            <Container fluid className={"mx-xxl-4"}>
                <img style={{maxWidth: "100%"}} height={"45px"} src={logo} alt={"СЗМК"} className={'me-2 me-xxl-4 my-auto'}/>

                <Navbar.Toggle aria-controls="app-navbar-nav"/>

                <Navbar.Offcanvas
                    placement="end"
                    data-bs-theme={'dark'}
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>
                            Фильтра
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {children}
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
});