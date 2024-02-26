import {Button, Offcanvas, Spinner} from "react-bootstrap";
import {memo, ReactNode, useContext, useMemo} from "react";

import {IsDesktopContext} from "@app";
import Logo from '@shared/assets/images/SZMK Logo White Horizontal 900х352.png';
import {AppNavigation} from "@widgets/AppNavigation";
import {useAppIsLoading} from "@shared/hooks";
import {useNavigate} from "react-router-dom";

interface AppNavbarProps {
    showNav: boolean;
    closeClb: () => void;
    children?: ReactNode;
}

export const AppNavbar = memo((props: AppNavbarProps) => {
    const {showNav, closeClb, children} = props;
    const {isLoading} = useAppIsLoading();
    const isDesktop = useContext(IsDesktopContext);

    let navigate = useNavigate();

    const backHandler = () => {
        navigate(-1);
    }

    const logoOpacity = useMemo(() => (
        window.history.length > 1 ? '1' : '0.6'
    ), [])

    if (isDesktop) {
        return (
            <div className={'bg-black text-white d-flex align-items-center justify-content-center p-3 appNavbar'}>
                {isLoading && <Spinner
                    className={'me-2 position-absolute'}
                    size={'sm'}
                    style={{left: '30px'}}
                />}

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

                        <div>
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