import {memo, ReactNode, useContext, useMemo} from "react";
import {Button, Offcanvas} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

import {IsDesktopContext} from "@app";
import {AppNavigation} from "@widgets/AppNavigation";
import {NotificationWidget} from "@widgets/NotificationWidget";

import Logo from '@shared/assets/images/SZMK Logo White Horizontal 900х352.png';
import {IndicatorWrapper} from "@shared/ui";
import {useAppModal} from "@shared/hooks";

interface AppNavbarProps {
    showNav: boolean;
    closeClb: () => void;
    children?: ReactNode;
}

export const AppNavbar = memo((props: AppNavbarProps) => {
    const {showNav, closeClb, children} = props;
    const isDesktop = useContext(IsDesktopContext);
    const {openModal} = useAppModal();

    let navigate = useNavigate();

    const notificationHandler = () => {
        openModal(
            <NotificationWidget/>
        )
    }

    const backHandler = () => {
        navigate(-1);
    }

    const logoOpacity = useMemo(() => (
        window.history.length > 1 ? '1' : '0.6'
    ), [])

    if (isDesktop) {
        return (
            <div className={'bg-black text-white d-flex align-items-center justify-content-center p-3 appNavbar'}>
                <div className={'d-flex'}
                     style={{minWidth: '1150px', maxWidth: '100%'}}
                >
                    <div className={'d-flex justify-content-between align-items-center gap-3'}
                         style={{minWidth: '1150px', maxWidth: '100%'}}
                    >
                        <div className={'d-flex flex-fill align-items-center gap-3'}
                             style={{maxWidth: '85%'}}>
                            <div>
                                <img src={Logo} alt={'SZMK logo'} style={{
                                    maxHeight: '38px',
                                    opacity: logoOpacity,
                                }} onClick={backHandler}/>
                            </div>
                            <div className={'d-flex gap-1'}>
                                {children}
                                <Button variant={'outline-dark'}
                                        onClick={() => window.location.reload()}
                                >
                                    <i className="text-white fas fa-sync-alt fs-6"/>
                                </Button>
                            </div>
                        </div>

                        <div className={'d-flex align-items-center'}>
                            <Button variant={'black'}
                                    onClick={notificationHandler}
                            >
                                <IndicatorWrapper indicator={"comment"} color={" bg-danger"}>
                                    <i className="far fa-bell"/>
                                </IndicatorWrapper>
                            </Button>

                            <AppNavigation isDesktop={isDesktop}/>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    return (
        <Offcanvas show={showNav} onHide={closeClb} data-bs-theme={'dark'} style={{maxWidth: '320px'}}>
            <Offcanvas.Header closeButton className={'p-3 pb-1'}>
                <Offcanvas.Title>
                    <img src={Logo} alt={'SZMK logo'} style={{maxWidth: '80px'}}/>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className={'d-flex flex-column gap-3 p-2'}>
                {children}
                <AppNavigation isDesktop={isDesktop}/>
            </Offcanvas.Body>
        </Offcanvas>
    )
})